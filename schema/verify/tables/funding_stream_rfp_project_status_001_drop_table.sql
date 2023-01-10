-- Verify cif:tables/funding_stream_rfp_project_status_001_drop_table on pg

begin;

select not exists (select from pg_tables where schemaname = 'cif' and tablename  = 'funding_stream_rfp_project_status');

rollback;
