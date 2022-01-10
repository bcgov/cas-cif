-- Revert cif:tables/funding_stream_rfp from pg

BEGIN;

drop table cif.funding_stream_rfp;

COMMIT;
