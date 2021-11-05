-- Revert ggircs-app:mutations/create_user_from_session from pg

begin;

drop function cif.create_user_from_session;

commit;
