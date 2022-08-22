-- Verify cif:util_functions/verify_function_not_present on pg

begin;

select pg_get_functiondef('cif_private.verify_function_not_present(text,text,int)'::regprocedure);

rollback;
