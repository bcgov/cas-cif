-- Verify cif:tables/project_revision_001_add_amendment_columns on pg

begin;

do $$
  begin
    assert (
      select true
      from information_schema.columns
      where table_schema='cif' and table_name='project_revision' and column_name='revision_type'
    ), 'column "revision_type" is not defined on table "project_revision"';
    assert (
      select true
      from information_schema.columns
      where table_schema='cif' and table_name='project_revision' and column_name='comments'
    ), 'column "comments" is not defined on table "project_revision"';
    assert (
      select true
      from information_schema.columns
      where table_schema='cif' and table_name='project_revision' and column_name='amendment_status'
    ), 'column "amendment_status" is not defined on table "project_revision"';
  end;
$$;

rollback;
