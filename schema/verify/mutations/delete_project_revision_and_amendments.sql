-- Verify cif:mutations/delete_project_revision_and_amendments on pg

begin;

select pg_get_functiondef('cif.delete_project_revision_and_amendments(int)'::regprocedure);

rollback;
