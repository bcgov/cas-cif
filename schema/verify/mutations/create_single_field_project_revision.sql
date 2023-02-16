-- Verify cif:mutations/create_single_field_project_revision on pg

begin;

select pg_get_functiondef('cif.create_single_field_project_revision(integer, varchar(1000), jsonb)'::regprocedure);

rollback;
