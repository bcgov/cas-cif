-- Revert cif:computed_columns/project_revision_project_milestone_report_form_changes from pg

begin;

drop function cif.project_revision_project_milestone_report_form_changes;

commit;
