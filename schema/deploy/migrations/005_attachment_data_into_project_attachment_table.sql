-- Deploy cif:migrations/005_attachment_data_into_project_attachment_table.sql to pg
-- requires: functions/migration_attachment_table_to_project_attachment_table

begin;

select cif_private.migration_attachment_table_to_project_attachment_table();

commit;
