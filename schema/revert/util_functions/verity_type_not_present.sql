-- Revert cif:util_functions/verify_type_not_present from pg

begin;

drop function cif_private.verify_type_not_present(text);

commit;
