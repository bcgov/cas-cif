-- Verify cif:tables/project_revision_004_add_pending_actions_from on pg

begin;

do $$
  begin
    assert (
      select true
      from information_schema.columns
      where table_schema='cif' and table_name='project_revision' and column_name='pending_actions_from'
    ), 'column "pending_actions_from" is not defined on table "project_revision"';
  end;
$$;

commit;
