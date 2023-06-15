-- Revert cif:migrations/006-create-project-attachment-form-changes_history from pg

begin;

/* No revert required.
   This is an idempotent data migration that creates the history of project_attachment form changes.
*/

commit;
