-- Verify cif:migrations/keycloak_user_sub_is_text on pg

begin;

do $$
  begin
    assert (
      select true from pg_catalog.pg_type where typname = 'keycloak_jwt'
    ), 'type "keycloak_jwt" is not defined';
    assert (
      select true
      from information_schema.columns
      where table_schema='cif' and table_name='cif_user' and column_name='session_sub'
    ), 'column "session_sub" is not defined on table "cif_user"';
  end;
$$;
select pg_get_functiondef('cif.session()'::regprocedure);
select pg_get_functiondef('cif_private.update_timestamps()'::regprocedure);

rollback;
