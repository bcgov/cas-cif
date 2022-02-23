-- Revert cif:computed_columns/project_pending_project_revision from pg

begin;

drop function cif.project_pending_project_revision;

commit;
