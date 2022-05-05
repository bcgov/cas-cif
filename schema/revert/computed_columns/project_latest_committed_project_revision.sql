-- Revert cif:computed_columns/project_latest_committed_project_revision from pg

begin;

drop function cif.project_latest_committed_project_revision;

commit;
