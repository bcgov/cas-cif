-- Revert cif:trigger_functions/save_form_changes from pg

begin;

drop function cif_private.save_form_change;

commit;
