-- Verify cif:computed_columns/project_primary_managers on pg

begin;

select pg_get_functiondef('cif.project_primary_managers(cif.project)'::regprocedure);

rollback;
