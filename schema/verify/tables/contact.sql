-- Verify cif:tables/contact on pg

begin;

select pg_catalog.has_table_privilege('cif.contact', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'contact', 'cif_internal');
select cif_private.verify_grant('insert', 'contact', 'cif_internal');
select cif_private.verify_grant('update', 'contact', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'contact', 'cif_admin');
select cif_private.verify_grant('insert', 'contact', 'cif_admin');
select cif_private.verify_grant('update', 'contact', 'cif_admin');

rollback;
