-- Revert cif:util_functions/import_swrs_operators from pg

begin;

drop function cif_private.import_swrs_operators;

commit;
