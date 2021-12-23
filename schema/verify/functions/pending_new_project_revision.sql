-- Verify cif:functions/pending_new_project_revision on pg

begin;

select pg_get_functiondef('cif.pending_new_project_revision()'::regprocedure);

rollback;
