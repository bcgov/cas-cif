-- Verify cif:tables/emission_intensity_payment_percent on pg

begin;

select pg_catalog.has_table_privilege('cif.emission_intensity_payment_percent', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'emission_intensity_payment_percent', 'cif_internal');
select cif_private.verify_grant('insert', 'emission_intensity_payment_percent', 'cif_internal');
select cif_private.verify_grant('update', 'emission_intensity_payment_percent', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'emission_intensity_payment_percent', 'cif_admin');
select cif_private.verify_grant('insert', 'emission_intensity_payment_percent', 'cif_admin');
select cif_private.verify_grant('update', 'emission_intensity_payment_percent', 'cif_admin');

rollback;
