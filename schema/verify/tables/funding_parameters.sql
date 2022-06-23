-- Verify cif:tables/funding_parameters on pg

begin;

select pg_catalog.has_table_privilege('cif.operator', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'funding_parameters', 'cif_internal');
select cif_private.verify_grant('insert', 'funding_parameters', 'cif_internal');
select cif_private.verify_grant('update', 'funding_parameters', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'funding_parameters', 'cif_admin');
select cif_private.verify_grant('insert', 'funding_parameters', 'cif_admin');
select cif_private.verify_grant('update', 'funding_parameters', 'cif_admin');

rollback;
