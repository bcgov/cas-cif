-- Verify cif:trigger_functions/funding_stream_is_immutable on pg

begin;

select pg_get_functiondef('cif_private.funding_stream_is_immutable()'::regprocedure);

rollback;
