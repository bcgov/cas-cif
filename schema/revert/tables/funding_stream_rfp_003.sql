-- Revert cif:tables/funding_stream_rfp_003 from pg

begin;

delete from cif.funding_stream_rfp where year = 2025;

commit;
