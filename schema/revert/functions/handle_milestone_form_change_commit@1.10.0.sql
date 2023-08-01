-- Revert cif:functions/handle_milestone_form_change_commit from pg

begin;

drop function cif_private.handle_milestone_form_change_commit;

commit;
