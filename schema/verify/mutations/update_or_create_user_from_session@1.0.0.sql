-- Verify cif:mutations/update_or_create_user_from_session on pg

begin;

select pg_get_functiondef('cif.update_or_create_user_from_session()'::regprocedure);

rollback;
