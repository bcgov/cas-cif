-- Revert cif:trigger_functions/set_initial_ancestor_form_change_ids from pg

begin;

drop function if exists cif_private.set_initial_ancestor_form_change_ids;

commit;
