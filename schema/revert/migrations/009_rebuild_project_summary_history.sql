-- Revert cif:migrations/009_rebuild_project_summary_history from pg

begin;

/* No revert required.
   This is an idempotent data migration that creates adds missing form_data_record_id to the project summary report form changes.
*/

commit;
