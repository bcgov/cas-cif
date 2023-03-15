-- Verify cif:computed_columns/project_revision_total_project_value on pg

begin;

select pg_get_functiondef('cif.project_revision_total_project_value(cif.project_revision)'::regprocedure);

rollback;
