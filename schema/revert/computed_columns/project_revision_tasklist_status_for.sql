-- Revert cif:computed_columns/project_revision_tasklist_status_for from pg

begin;

drop function cif.project_revision_tasklist_status_for;

commit;
