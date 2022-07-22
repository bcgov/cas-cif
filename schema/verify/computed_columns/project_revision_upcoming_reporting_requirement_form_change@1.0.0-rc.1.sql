-- Verify cif:computed_columns/project_revision_upcoming_reporting_requirement_form_change on pg

begin;


select pg_get_functiondef('cif.project_revision_upcoming_reporting_requirement_form_change(cif.project_revision, text)'::regprocedure);


rollback;
