-- Revert cif:functions/migration_create_project_attachment_form_changes_history from pg

begin;

drop function cif_private.migration_create_project_attachment_form_changes_history;

commit;
