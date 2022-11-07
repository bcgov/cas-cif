-- Verify cif:trigger_functions/update_timestamps_001_uuid_to_session_sub on pg

begin;

select pg_get_functiondef('cif_private.update_timestamps()'::regprocedure);

rollback;
