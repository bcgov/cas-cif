-- Revert cif:mutations/create_user_from_session_002_create_after_cif_user_update from pg

begin;

drop function cif.create_user_from_session;

commit;
