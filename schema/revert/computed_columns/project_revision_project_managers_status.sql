-- Revert cif:computed_columns/project_revision_project_managers_status from pg

begin;

drop function cif.project_revision_project_managers_status;

commit;
