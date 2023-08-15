-- Verify cif:computed_columns/project_milestone_status on pg

begin;

select pg_get_functiondef('cif.project_milestone_status(cif.project)'::regprocedure);

rollback;
