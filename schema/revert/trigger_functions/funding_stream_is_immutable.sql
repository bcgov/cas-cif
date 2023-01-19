-- Revert cif:trigger_functions/funding_stream_is_immutable from pg

begin;

drop function if exists cif_private.funding_stream_is_immutable;

commit;
