-- Verify cif:tables/funding_parameter_003_drop_total_project_value_column on pg

begin;

do $$
  begin
    assert (
      select not exists (
        select 1
        from information_schema.columns
        where table_schema = 'cif'
          and table_name = 'funding_parameter'
          and column_name = 'total_project_value'
      )
    ), 'column "total_project_value" is defined on table "funding_parameter"';
  end;
$$;

rollback;
