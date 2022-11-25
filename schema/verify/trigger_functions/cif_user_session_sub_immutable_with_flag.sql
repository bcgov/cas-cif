-- Verify cif:trigger_functions/cif_user_session_sub_immutable_with_flag on pg

begin;

select pg_get_functiondef('cif_private.cif_user_session_sub_immutable_with_flag_set()'::regprocedure);

rollback;
