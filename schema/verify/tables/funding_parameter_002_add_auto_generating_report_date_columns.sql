-- Verify cif:tables/funding_parameter_002_add_auto_generating_report_date_columns on pg

begin;

do $$
  begin
    assert (
      select true
      from information_schema.columns
      where table_schema='cif' and table_name='funding_parameter' and column_name='contract_start_date'
    ), 'column "contract_start_date" is not defined on table "funding_parameter"';
  end;
$$;

rollback;
