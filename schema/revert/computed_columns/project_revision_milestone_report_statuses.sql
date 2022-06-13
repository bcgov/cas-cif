-- Revert cif:computed_columns/project_revision_milestone_report_statuses from pg

begin;

drop function cif.project_revision_milestone_report_statuses;

commit;
