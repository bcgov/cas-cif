-- Revert cif:functions/revert_keycloak_user_sub_is_text from pg

begin;

drop function cif_private.revert_keycloak_user_sub_is_text;

commit;
