-- Verify cif:functions/revert_keycloak_user_sub_is_text on pg

begin;

select pg_get_functiondef('cif_private.revert_keycloak_user_sub_is_text()'::regprocedure);

rollback;
