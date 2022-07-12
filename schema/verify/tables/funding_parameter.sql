-- Verify cif:tables/funding_parameter on pg

begin;

select pg_catalog.has_table_privilege('cif.operator', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'funding_parameter', 'cif_internal');
select cif_private.verify_grant('insert', 'funding_parameter', 'cif_internal');
select cif_private.verify_grant('update', 'funding_parameter', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'funding_parameter', 'cif_admin');
select cif_private.verify_grant('insert', 'funding_parameter', 'cif_admin');
select cif_private.verify_grant('update', 'funding_parameter', 'cif_admin');

rollback;
