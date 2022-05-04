-- Revert cif:computed_columns/project_revision_quarterly_report_form_changes from pg

begin;

drop function cif.project_revision_quarterly_report_form_changes;

commit;
