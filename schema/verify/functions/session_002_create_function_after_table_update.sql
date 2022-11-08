-- Verify cif:functions/session_002_create_function_after_table_update on pg

begin;

select pg_get_functiondef('cif.session()'::regprocedure);

rollback;
