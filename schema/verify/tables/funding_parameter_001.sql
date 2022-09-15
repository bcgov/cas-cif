-- Verify cif:tables/funding_parameter_001 on pg

begin;

do $$
  begin
    assert (
      select true
      from information_schema.columns
      where table_schema='cif' and table_name='funding_parameter' and column_name='proponent_cost'
    ), 'column "proponent_cost" is not defined on table "funding_parameter"';
  end;
$$;

rollback;
