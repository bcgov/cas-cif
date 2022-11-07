-- Verify cif:trigger_functions/set_user_id_002_create_after_cif_user_update on pg

begin;

select pg_get_functiondef('cif_private.set_user_id()'::regprocedure);

rollback;
