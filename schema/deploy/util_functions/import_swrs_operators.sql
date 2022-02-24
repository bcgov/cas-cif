-- Deploy cif:util_functions/import_swrs_operators to pg
-- requires: tables/operator
-- requires: schemas/private

begin;

-- Creates a foreign table and imports the operators from the ggircs database into the operator table in the cif database.
create or replace function cif_private.import_swrs_operators(
  ggircs_host text,
  ggircs_dbname text,
  ggircs_port text,
  ggircs_user text,
  ggircs_pword text
)
returns void as
$function$
  begin

    -- Disable trigger that sets the manually updated flags
    alter table cif.operator disable trigger operator_data_manually_updated;
    -- Enable trigger that protects the manually updated data from upserts
    alter table cif.operator enable trigger protect_manually_updated_operator_data;

    -- Create fdw server
    execute format('create server swrs_import_server foreign data wrapper postgres_fdw options (host %s, dbname %s, port %s)', quote_literal($1), quote_literal($2), quote_literal($3));
    -- Create fdw user mapping
    execute format('create user mapping for current_user server swrs_import_server options (user %s, password %s)', quote_literal($4), quote_literal($5));

    -- Create operator foreign table
    create foreign table swrs_operator (
      id integer,
      report_id integer,
      swrs_organisation_id integer,
      business_legal_name varchar(1000),
      english_trade_name varchar(1000)
    ) server swrs_import_server options (schema_name 'swrs', table_name 'organisation');

    -- Create report foreign table
    create foreign table swrs_report(
      id integer,
      swrs_organisation_id integer,
      reporting_period_duration integer
    ) server swrs_import_server options (schema_name 'swrs', table_name 'report');

    -- Upsert the latest organisation data into the cif.operator table if the data has not been changed by a cif user
    execute
      $$
        with latest_reporting_period as (
          select o.swrs_organisation_id, max(reporting_period_duration) as last_reporting_period
          from swrs_operator o
          join swrs_report r
            on o.report_id = r.id
          group by o.swrs_organisation_id
        ),
        latest_reports as (
          -- Pick the report from the latest reporting year that was inserted last
          -- This applies if there are multiple facilities per organisation
          -- The organisation data is expected to be the same for both facilities.
          select max(id) as id, r.swrs_organisation_id from swrs_report r
            join latest_reporting_period
              on r.swrs_organisation_id = latest_reporting_period.swrs_organisation_id
              and r.reporting_period_duration = latest_reporting_period.last_reporting_period
          group by r.swrs_organisation_id
        ),
        operators_to_insert as (
          select
              swrs_operator.swrs_organisation_id as swrs_organisation_id,
              business_legal_name, english_trade_name,
              (select id from cif.operator where swrs_operator.swrs_organisation_id=cif.operator.swrs_organisation_id) as existing_operator_id
          from swrs_operator
          inner join latest_reports on report_id = latest_reports.id
        )
        insert into cif.form_change(
          new_form_data,
          operation,
          form_data_schema_name,
          form_data_table_name,
          form_data_record_id,
          project_revision_id,
          change_status,
          change_reason,
          json_schema_name
        ) (
          select
            format('{"swrs_organisation_id": %s , "legal_name": %s , "trade_name": %s }',
              operators_to_insert.swrs_organisation_id,
              quote_ident(operators_to_insert.business_legal_name),
              quote_ident(operators_to_insert.english_trade_name)
            )::jsonb,
            case when operators_to_insert.existing_operator_id is null then 'create'::cif.form_change_operation else 'update'::cif.form_change_operation end,
            'cif',
            'operator',
            operators_to_insert.existing_operator_id,
            null,
            'committed',
            'Operator automatically imported from SWRS',
            'operator'
          from operators_to_insert
        )

      $$;

    drop server swrs_import_server cascade;

    -- Enable trigger that sets the manually updated flags
    alter table cif.operator enable trigger operator_data_manually_updated;
    -- Disable trigger that protects the manually updated data from upserts
    alter table cif.operator disable trigger protect_manually_updated_operator_data;

  end;

$function$ language plpgsql volatile;

comment on function cif_private.import_swrs_operators(text, text, text, text, text) is
  'Function to import the operators from the ggircs ETL database into the cif database';

commit;
