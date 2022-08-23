-- Revert cif:util_functions/import_swrs_operators_from_fdw from pg

begin;

drop function cif_private.import_swrs_operators_from_fdw;

commit;
