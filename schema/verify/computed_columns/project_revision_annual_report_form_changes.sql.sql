-- Verify cif:computed_column/project_revision_annual_report_form_changes.sql on pg

BEGIN;

select pg_get_functiondef('cif.project_revision_project_annual_report_form_changes(cif.project_revision)'::regprocedure);

ROLLBACK;
