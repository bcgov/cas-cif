-- Verify cif:database_functions/verify_type_not_present on pg

begin;

select pg_get_functiondef('cif_private.verify_type_not_present(text)'::regprocedure);

rollback;
