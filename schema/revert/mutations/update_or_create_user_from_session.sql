-- Revert cif:mutations/update_or_create_user_from_session from pg

begin;

drop function cif.update_or_create_user_from_session;

commit;