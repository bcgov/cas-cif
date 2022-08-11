-- Verify cif:tables/additional_funding_source on pg

begin;

select pg_catalog.has_table_privilege('cif.additional_funding_source', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'additional_funding_source', 'cif_internal');
select cif_private.verify_grant('update', 'additional_funding_source', 'cif_internal');
select cif_private.verify_grant('insert', 'additional_funding_source', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'additional_funding_source', 'cif_admin');
select cif_private.verify_grant('insert', 'additional_funding_source', 'cif_admin');
select cif_private.verify_grant('update', 'additional_funding_source', 'cif_admin');

rollback;
