-- Verify cif:trigger_functions/deleted_records_are_immutable on pg

begin;

select pg_get_functiondef('cif_private.deleted_records_are_immutable()'::regprocedure);

rollback;
