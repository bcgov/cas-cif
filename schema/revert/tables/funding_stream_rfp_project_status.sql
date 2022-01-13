-- Revert cif:tables/funding_stream_rfp_project_status from pg

BEGIN;

drop table cif.funding_stream_rfp_project_status;

COMMIT;
