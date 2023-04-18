-- Revert cif:computed_columns/project_pending_general_revision from pg

begin;

drop function cif.project_pending_general_revision;

commit;
