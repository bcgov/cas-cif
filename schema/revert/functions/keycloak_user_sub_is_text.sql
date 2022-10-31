-- Revert cif:functions/keycloak_user_sub_is_text from pg

begin;

drop function cif_private.keycloak_user_sub_is_text;

commit;
