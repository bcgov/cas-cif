-- Verify cif:tables/payment_001 on pg

begin;

select pg_catalog.has_table_privilege('cif.payment', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'payment', 'cif_internal');
select cif_private.verify_grant('update', 'payment', 'cif_internal');
select cif_private.verify_grant('insert', 'payment', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'payment', 'cif_admin');
select cif_private.verify_grant('insert', 'payment', 'cif_admin');
select cif_private.verify_grant('update', 'payment', 'cif_admin');

rollback;
