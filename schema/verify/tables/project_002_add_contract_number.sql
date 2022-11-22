-- Verify cif:tables/project_002_add_contract_number on pg

begin;

do $$
  begin
    assert (
      select true
      from information_schema.columns
      where table_schema='cif' and table_name='project' and column_name='contract_number'
    ), 'column "contract_number" is not defined on table "project"';
  end;
$$;

rollback;
