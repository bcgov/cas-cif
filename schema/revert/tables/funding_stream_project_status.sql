-- Revert cif:tables/funding_stream_project_status from pg

begin;

drop table cif.funding_stream_project_status;

commit;
