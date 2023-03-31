-- Deploy cif:tables/funding_stream_rfp_001 to pg

begin;

insert into cif.funding_stream_rfp (year, funding_stream_id) values
(2023, 1), (2023, 2);

commit;
