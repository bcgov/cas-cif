-- Verify cif:tables/cif_user_002_uuid_to_session_sub on pg

begin;

do $$
  begin
    assert (
      select true
      from information_schema.columns
      where table_schema='cif' and table_name='cif_user' and column_name='session_sub'
    ), 'column "session_sub" is not defined on table "cif_user"';
  end;
$$;

rollback;
