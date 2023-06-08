-- Verify cif:functions/migration_create_project_attachment_form_changes_history on pg

begin;

select pg_get_functiondef('cif_private.migration_create_project_attachment_form_changes_history()'::regprocedure);

rollback;
