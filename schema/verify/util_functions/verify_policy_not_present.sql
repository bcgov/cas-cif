-- Verify cif:database_functions/verify_policy_not_present on pg

begin;

select pg_get_functiondef('cif_private.verify_policy_not_present(text,text)'::regprocedure);

rollback;
