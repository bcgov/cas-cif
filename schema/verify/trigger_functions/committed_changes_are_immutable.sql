-- Verify cif:trigger_functions/committed_changes_are_immutable on pg

begin;

select pg_get_functiondef('cif_private.committed_changes_are_immutable()'::regprocedure);

rollback;
