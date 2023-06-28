-- Deploy cif:migrations/007_create_form_changes_for_existing_rpoject_attachments to pg
-- requires: tables/form_change
-- requires: tables/project_attachment

begin;

  alter table cif.form_change disable trigger _100_timestamps;

  select cif_private.migration_create_form_changes_for_existing_project_attachments();

  alter table cif.form_change enable trigger _100_timestamps;

commit;
