-- Verify cif:util_functions/import_swrs_operators_from_fdw on pg

begin;

select pg_get_functiondef('cif_private.import_swrs_operators_from_fdw(text,text)'::regprocedure);

rollback;
