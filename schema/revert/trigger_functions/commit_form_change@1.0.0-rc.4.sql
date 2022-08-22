-- Revert cif:trigger_functions/commit_form_changes from pg

begin;

drop function cif_private.commit_form_change;

commit;
