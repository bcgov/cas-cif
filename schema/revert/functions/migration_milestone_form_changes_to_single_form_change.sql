-- Revert cif:functions/migration_milestone_form_changes_to_single_form_change from pg

begin;

drop function cif_private.migration_milestone_form_changes_to_single_form_change;

commit;
