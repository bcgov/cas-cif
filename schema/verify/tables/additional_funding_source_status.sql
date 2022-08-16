-- Verify cif:tables/additional_funding_source_status on pg

begin;

select pg_catalog.has_table_privilege('cif.additional_funding_source_status', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'additional_funding_source_status', 'cif_internal');
select cif_private.verify_grant('update', 'additional_funding_source_status', 'cif_internal');
select cif_private.verify_grant('insert', 'additional_funding_source_status', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'additional_funding_source_status', 'cif_admin');
select cif_private.verify_grant('insert', 'additional_funding_source_status', 'cif_admin');
select cif_private.verify_grant('update', 'additional_funding_source_status', 'cif_admin');


rollback;
