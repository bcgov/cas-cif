-- Revert cif:tables/funding_stream_rfp_001 from pg

begin;

delete from cif.funding_stream_rfp where year = 2023;

commit;
