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

    perform cif_private.import_swrs_operators_from_fdw('swrs_operator', 'swrs_report');

    drop server swrs_import_server cascade;

  end;

$function$ language plpgsql volatile;

comment on function cif_private.import_swrs_operators(text, text, text, text, text) is
  'Function to import the operators from the ggircs ETL database into the cif database';


commit;
