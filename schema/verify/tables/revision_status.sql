-- Verify cif:tables/revision_status on pg

begin;

select pg_catalog.has_table_privilege('cif.reporting_requirement', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'reporting_requirement', 'cif_internal');
select cif_private.verify_grant('update', 'reporting_requirement', 'cif_internal');
select cif_private.verify_grant('insert', 'reporting_requirement', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'reporting_requirement', 'cif_admin');
select cif_private.verify_grant('insert', 'reporting_requirement', 'cif_admin');
select cif_private.verify_grant('update', 'reporting_requirement', 'cif_admin');


rollback;
