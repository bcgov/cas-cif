-- Verify cif:functions/session on pg

begin;

select pg_get_functiondef('cif.session()'::regprocedure);

rollback;
