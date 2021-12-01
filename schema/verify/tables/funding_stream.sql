-- Verify cif:tables/funding_stream on pg

BEGIN;

select pg_catalog.has_table_privilege('cif.funding_stream', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'funding_stream', 'cif_internal');
select cif_private.verify_grant('insert', 'funding_stream', 'cif_internal');
select cif_private.verify_grant('update', 'funding_stream', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'funding_stream', 'cif_admin');
select cif_private.verify_grant('insert', 'funding_stream', 'cif_admin');
select cif_private.verify_grant('update', 'funding_stream', 'cif_admin');

ROLLBACK;
