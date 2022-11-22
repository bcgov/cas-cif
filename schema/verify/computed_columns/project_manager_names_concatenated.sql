-- Verify cif:computed_columns/project_manager_names_concatenated on pg

begin;

select pg_get_functiondef('cif.project_manager_names_concatenated(cif.project)'::regprocedure);

rollback;
