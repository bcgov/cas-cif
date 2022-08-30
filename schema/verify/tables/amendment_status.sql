-- Verify cif:tables/amendment_status on pg

begin;

select pg_catalog.has_table_privilege('cif.amendment_status', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'amendment_status', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'amendment_status', 'cif_admin');


rollback;
