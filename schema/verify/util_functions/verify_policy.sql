-- Verify cif:database_functions/verify_policy on pg

begin;

select pg_get_functiondef('cif_private.verify_policy(text,text,text,text,text)'::regprocedure);

rollback;
