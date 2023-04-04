-- Revert cif:computed_columns/project_revision_total_project_value from pg

begin;

drop function cif.project_revision_total_project_value;

commit;
