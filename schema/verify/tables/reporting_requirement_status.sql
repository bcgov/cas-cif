-- Verify cif:tables/reporting_requirement_status on pg

begin;

select pg_catalog.has_table_privilege('cif.reporting_requirement_status', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'reporting_requirement_status', 'cif_internal');
select cif_private.verify_grant('update', 'reporting_requirement_status', 'cif_internal');
select cif_private.verify_grant('insert', 'reporting_requirement_status', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'reporting_requirement_status', 'cif_admin');
select cif_private.verify_grant('insert', 'reporting_requirement_status', 'cif_admin');
select cif_private.verify_grant('update', 'reporting_requirement_status', 'cif_admin');


rollback;
