-- Verify cif:functions/migration_create_form_changes_for_existing_project_attachments on pg

begin;

select pg_get_functiondef('cif_private.migration_create_form_changes_for_existing_project_attachments()'::regprocedure);

rollback;
