-- Deploy cif:migrations/006-create-project-attachment-form-changes_history to pg
-- requires: tables/form_change
-- requires: tables/project_attachment

begin;

  alter table cif.form_change disable trigger _100_timestamps;

  select cif_private.migration_create_project_attachment_form_changes_history();

  alter table cif.form_change enable trigger _100_timestamps;

commit;
