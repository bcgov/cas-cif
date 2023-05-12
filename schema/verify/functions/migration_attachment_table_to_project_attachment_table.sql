-- Verify cif:functions/migration_attachment_table_to_project_attachment_table on pg

begin;

select pg_get_functiondef('cif_private.migration_attachment_table_to_project_attachment_table()'::regprocedure);

rollback;
