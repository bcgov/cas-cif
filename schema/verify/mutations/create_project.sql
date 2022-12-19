-- Verify cif:mutations/create_project on pg

begin;

select pg_get_functiondef('cif.create_project(integer)'::regprocedure);

rollback;
