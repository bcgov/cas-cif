-- Revert cif:tables/funding_stream_rfp_002 from pg

begin;

delete from cif.funding_stream_rfp where year = 2024;

commit;
