-- Verify cif:tables/funding_stream_project_status on pg

begin;

select pg_catalog.has_table_privilege('cif.funding_stream_project_status', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'funding_stream_project_status', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'funding_stream_project_status', 'cif_admin');
select cif_private.verify_grant('insert', 'funding_stream_project_status', 'cif_admin');
select cif_private.verify_grant('update', 'funding_stream_project_status', 'cif_admin');

rollback;
