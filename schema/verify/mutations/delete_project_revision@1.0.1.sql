-- Verify cif:mutations/delete_project_revision on pg

begin;

select pg_get_functiondef('cif.delete_project_revision(int)'::regprocedure);

rollback;
