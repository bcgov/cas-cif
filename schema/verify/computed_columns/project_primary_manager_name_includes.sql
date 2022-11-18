-- Verify cif:computed_columns/project_primary_manager_name_includes on pg

begin;

select pg_get_functiondef('cif.project_primary_manager_name_includes(cif.project, text)'::regprocedure);

rollback;
