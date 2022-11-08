-- Verify cif:mutations/create_user_from_session_002_create_after_cif_user_update on pg

begin;

select pg_get_functiondef('cif.create_user_from_session()'::regprocedure);

rollback;
