-- Verify cif:functions/raise_exception on pg

begin;

select pg_get_functiondef('cif_private.raise_exception(text)'::regprocedure);

rollback;
