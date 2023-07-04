-- Revert cif:functions/migration_create_form_changes_for_existing_project_attachments from pg

begin;

drop function cif_private.migration_create_form_changes_for_existing_project_attachments;

commit;
