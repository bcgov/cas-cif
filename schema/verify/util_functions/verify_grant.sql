-- Verify cif:database_functions/verify_grants on pg

begin;

select pg_get_functiondef('cif_private.verify_grant(text,text,text,text)'::regprocedure);
select pg_get_functiondef('cif_private.verify_grant(text,text,text,text[],text)'::regprocedure);

rollback;
