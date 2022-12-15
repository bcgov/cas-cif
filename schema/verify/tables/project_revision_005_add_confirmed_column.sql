-- Verify cif:project_revision_005_add_confirmed_column on pg

begin;

do $$
  begin
    assert (
      select true
      from information_schema.columns
      where table_schema='cif' and table_name='project_revision' and column_name='is_funding_stream_confirmed'
    ), 'column "is_funding_stream_confirmed" is defined on table "project_revision"';
  end;
$$;

commit;
