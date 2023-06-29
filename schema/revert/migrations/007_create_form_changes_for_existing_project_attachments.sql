-- Revert cif:migrations/007_create_form_changes_for_existing_project_attachments from pg

begin;

/* No revert required.
   This is an idempotent data migration that creates project_attachment form_changes for existing project_attachments.
*/

commit;
