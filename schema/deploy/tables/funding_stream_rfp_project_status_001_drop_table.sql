-- Deploy cif:tables/funding_stream_rfp_project_status_001_drop_table to pg
-- requires: tables/funding_stream_rfp_project_status

begin;

drop table if exists cif.funding_stream_rfp_project_status;

commit;
