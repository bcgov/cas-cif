-- Deploy cif:tables/funding_stream_rfp_003 to pg

begin;

insert into cif.funding_stream_rfp (year, funding_stream_id) values
(2025, 1), (2025, 2);

commit;
