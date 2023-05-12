-- Verify cif:tables/attachment_001_drop_project_id_project_status_id.sql on pg

begin;

do $$
  begin
    assert (
      select not exists (
        select 1
        from information_schema.columns
        where table_schema = 'cif'
          and table_name = 'attachment'
          and column_name = 'project_id'
      )
    ), 'column "project_id" is defined on table "attachment"';
    assert (
      select not exists (
        select 1
        from information_schema.columns
        where table_schema = 'cif'
          and table_name = 'attachment'
          and column_name = 'project_status_id'
      )
    ), 'column "project_status_id" is defined on table "attachment"';
  end;
$$;

rollback;
