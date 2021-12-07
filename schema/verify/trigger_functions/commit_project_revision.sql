-- Verify cif:trigger_functions/commit_project_revision on pg

begin;

select pg_get_functiondef('cif.commit_project_revision()'::regprocedure);

rollback;
