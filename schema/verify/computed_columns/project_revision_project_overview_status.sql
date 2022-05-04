-- Verify cif:computed_columns/project_revision_project_overview_status on pg

begin;

select pg_get_functiondef('cif.project_revision_project_overview_status(cif.project_revision)'::regprocedure);

rollback;
