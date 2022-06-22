-- Verify cif:tables/emission_intensity_payment_percentage on pg

begin;

select pg_catalog.has_table_privilege('cif.emission_intensity_payment_percentage', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'emission_intensity_payment_percentage', 'cif_internal');
select cif_private.verify_grant('insert', 'emission_intensity_payment_percentage', 'cif_internal');
select cif_private.verify_grant('update', 'emission_intensity_payment_percentage', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'emission_intensity_payment_percentage', 'cif_admin');
select cif_private.verify_grant('insert', 'emission_intensity_payment_percentage', 'cif_admin');
select cif_private.verify_grant('update', 'emission_intensity_payment_percentage', 'cif_admin');

rollback;
