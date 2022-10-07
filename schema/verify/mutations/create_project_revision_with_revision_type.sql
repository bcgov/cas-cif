-- Verify cif:mutations/create_project_revision_with_revision_type on pg

begin;

select pg_get_functiondef('cif.create_project_revision(integer)'::regprocedure);

rollback;
