-- Verify cif:migrations/migrate_keycloak_user_sub_to_text on pg

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
select pg_get_functiondef('cif.contact_pending_form_change(cif.contact)'::regprocedure);
select pg_get_functiondef('cif.operator_pending_form_change(cif.operator)'::regprocedure);
select pg_get_functiondef('cif.pending_new_form_change_for_table(text)'::regprocedure);
select pg_get_functiondef('cif.pending_new_project_revision()'::regprocedure);
select pg_get_functiondef('cif.create_user_from_session()'::regprocedure);
select pg_get_functiondef('cif_private.set_user_id()'::regprocedure);

rollback;
