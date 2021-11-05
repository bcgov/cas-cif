-- Revert cif:util_functions/verify_function_not_present from pg

begin;

drop function cif_private.verify_function_not_present(text);

commit;
