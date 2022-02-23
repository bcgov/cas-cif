-- Verify cif:computed_columns/project_pending_project_revision on pg

begin;

select pg_get_functiondef('cif.project_pending_project_revision(cif.project)'::regprocedure);

rollback;
