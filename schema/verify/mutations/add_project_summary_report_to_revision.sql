-- Verify cif:mutations/add_project_summary_report_to_revision on pg

BEGIN;

select pg_get_functiondef('cif.add_project_summary_report_to_revision(int, int)'::regprocedure);

ROLLBACK;
