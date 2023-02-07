-- Revert cif:computed_columns/project_next_milestone_due_date from pg

begin;

drop function cif.project_next_milestone_due_date(cif.project);

commit;
