-- Verify cif:mutations/delete_project_revision_001_bugfix on pg

begin;

select pg_get_functiondef('cif.delete_project_revision(int)'::regprocedure);

rollback;
