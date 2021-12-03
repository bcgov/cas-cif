-- Revert cif:tables/funding_stream from pg

BEGIN;

drop table cif.funding_stream;

COMMIT;
