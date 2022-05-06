-- Revert cif:computed_columns/project_revision_project_contacts_status from pg

begin;

drop function cif.project_revision_project_contacts_status;

commit;
