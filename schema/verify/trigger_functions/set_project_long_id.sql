-- Verify cif:trigger_functions/set_project_long_id on pg

begin;

select pg_get_functiondef('cif_private.set_project_long_id()'::regprocedure);

rollback;
