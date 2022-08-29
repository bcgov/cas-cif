-- Deploy cif:util_functions/import_swrs_operators_from_fdw to pg

begin;

-- This functions queries the SWRS tables and commits form_change records to the cif database.
-- It is meant to be used in conjunction to a foreign data wrapper to the SWRS database's operator and report tables.
create or replace function cif_private.import_swrs_operators_from_fdw(
  swrs_operator_table_name text,
  swrs_report_table_name text
)
returns void as
$function$
begin

  execute
    format(
    $$
    -- Upsert the latest organisation data into the cif.operator table if the data has not been changed by a cif user
      with latest_reporting_period as (
        select o.swrs_organisation_id, max(reporting_period_duration) as last_reporting_period
        from %1$s o
        join %2$s r
          on o.report_id = r.id
        group by o.swrs_organisation_id
      ),
      latest_reports as (
        -- Pick the report from the latest reporting year that was inserted last
        -- This applies if there are multiple facilities per organisation
        -- The organisation data is expected to be the same for both facilities.
        select max(id) as id, r.swrs_organisation_id from %2$s r
          join latest_reporting_period
            on r.swrs_organisation_id = latest_reporting_period.swrs_organisation_id
            and r.reporting_period_duration = latest_reporting_period.last_reporting_period
        group by r.swrs_organisation_id
      ),
      operators_to_insert as (
        select
            %1$s.swrs_organisation_id as swrs_organisation_id,
            business_legal_name as swrs_legal_name,
            english_trade_name as swrs_trade_name,
            case
              -- if cif_operator is null (new operator) or cif_operator exists and the swrs and cif names
              -- are identical (no manual update from the frontend), then we update the cif name.
              when cif_operator is null or cif_operator.swrs_legal_name=cif_operator.legal_name then business_legal_name
              else cif_operator.legal_name
            end as legal_name,
            case
              when cif_operator is null or cif_operator.swrs_trade_name=cif_operator.trade_name then english_trade_name
              else cif_operator.trade_name
            end as trade_name,
            cif_operator.id as existing_operator_id
        from %1$s
        inner join latest_reports on report_id = latest_reports.id
        left join cif.operator as cif_operator on %1$s.swrs_organisation_id = cif_operator.swrs_organisation_id
        where
            cif_operator is null
          or
            cif_operator.swrs_legal_name != business_legal_name
          or
            cif_operator.swrs_trade_name != english_trade_name
      )
      insert into cif.form_change(
        new_form_data,
        operation,
        form_data_schema_name,
        form_data_table_name,
        form_data_record_id,
        project_revision_id,
        change_status,
        json_schema_name
      ) (
        select
          format('{
              "swrsOrganisationId": %%s,
              "swrsLegalName": "%%s",
              "swrsTradeName": "%%s",
              "legalName": "%%s",
              "tradeName": "%%s"
            }',
            operators_to_insert.swrs_organisation_id,
            operators_to_insert.swrs_legal_name,
            operators_to_insert.swrs_trade_name,
            operators_to_insert.legal_name,
            operators_to_insert.trade_name
          )::jsonb,
          case
            when operators_to_insert.existing_operator_id is null
              then 'create'::cif.form_change_operation
              else 'update'::cif.form_change_operation
          end,
          'cif',
          'operator',
          operators_to_insert.existing_operator_id,
          null,
          'committed',
          'operator'
        from operators_to_insert
      )
    $$
    , quote_ident($1), quote_ident($2));

end;
$function$ language plpgsql;


commit;
