-- Deploy cif:tables/funding_stream_rfp_002 to pg


begin;

insert into cif.funding_stream_rfp (year, funding_stream_id) values
(2024, 1), (2024, 2);

commit;

