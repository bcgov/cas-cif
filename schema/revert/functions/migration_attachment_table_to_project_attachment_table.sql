-- Revert cif:functions/migration_attachment_table_to_project_attachment_table from pg

begin;

drop function cif_private.migration_attachment_table_to_project_attachment_table;

commit;
