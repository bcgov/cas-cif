-- Verify cif:util_functions/import_swrs_operators on pg

begin;

select pg_get_functiondef('cif_private.import_swrs_operators(text,text,text,text,text)'::regprocedure);

rollback;
