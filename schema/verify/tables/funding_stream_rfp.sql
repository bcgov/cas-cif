-- Verify cif:tables/funding_stream_rfp on pg

BEGIN;

select pg_catalog.has_table_privilege('cif.funding_stream_rfp', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'funding_stream_rfp', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'funding_stream_rfp', 'cif_admin');
select cif_private.verify_grant('insert', 'funding_stream_rfp', 'cif_admin');
select cif_private.verify_grant('update', 'funding_stream_rfp', 'cif_admin');

ROLLBACK;
