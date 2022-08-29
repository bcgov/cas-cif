-- Verify cif:tables/amendment_type on pg

begin;

select pg_catalog.has_table_privilege('cif.amendment_type', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'amendment_type', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'amendment_type', 'cif_admin');

rollback;
