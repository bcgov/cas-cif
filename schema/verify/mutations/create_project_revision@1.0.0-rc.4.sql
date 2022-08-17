-- Verify cif:mutations/create_project_revision on pg

begin;

select pg_get_functiondef('cif.create_project_revision(integer)'::regprocedure);

rollback;
