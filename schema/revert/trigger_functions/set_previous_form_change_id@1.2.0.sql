-- Revert cif:trigger_functions/set_previous_form_change_id from pg

begin;

drop function cif_private.set_previous_form_change_id;

commit;
