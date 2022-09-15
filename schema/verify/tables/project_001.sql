-- Verify cif:tables/project_001 on pg

begin;

do $$
  begin
    assert (
      select true
      from information_schema.columns
      where table_schema='cif' and table_name='project' and column_name='score'
    ), 'column "score" is not defined on table "project"';
    assert (
      select true
      from information_schema.columns
      where table_schema='cif' and table_name='project' and column_name='project_type'
    ), 'column "project_type" is not defined on table "project"';
  end;
$$;

rollback;
