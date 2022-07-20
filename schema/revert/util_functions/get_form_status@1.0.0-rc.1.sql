-- Revert cif:util_functions/get_form_status from pg

begin;

drop function cif.get_form_status;

commit;
