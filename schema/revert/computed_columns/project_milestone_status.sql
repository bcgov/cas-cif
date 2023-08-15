-- Revert cif:computed_columns/project_milestone_status from pg

begin;

drop function cif.project_milestone_status(cif.project);

commit;
