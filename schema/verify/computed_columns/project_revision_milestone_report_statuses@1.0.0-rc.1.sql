-- Verify cif:computed_columns/project_revision_milestone_report_statuses on pg

begin;

select pg_get_functiondef('cif.project_revision_milestone_report_statuses(cif.project_revision)'::regprocedure);

rollback;
