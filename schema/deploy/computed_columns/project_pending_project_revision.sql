-- Deploy cif:computed_columns/project_pending_project_revision to pg

begin;

drop function cif.project_pending_project_revision;

commit;
