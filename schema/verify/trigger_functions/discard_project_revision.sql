-- Verify cif:trigger_functions/discard_project_revision on pg

begin;

select pg_get_functiondef('cif_private.discard_project_revision()'::regprocedure);

rollback;
