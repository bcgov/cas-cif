-- Revert cif:computed_column/project_revision_annual_report_form_changes.sql from pg

BEGIN;

drop function cif.project_revision_project_annual_report_form_changes;

COMMIT;
