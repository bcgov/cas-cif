-- Verify cif:tables/project_status on pg

BEGIN;

select pg_catalog.has_table_privilege('cif.project_status', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'project_status', 'cif_internal');
select cif_private.verify_grant('insert', 'project_status', 'cif_internal');
select cif_private.verify_grant('update', 'project_status', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'project_status', 'cif_admin');
select cif_private.verify_grant('insert', 'project_status', 'cif_admin');
select cif_private.verify_grant('update', 'project_status', 'cif_admin');

ROLLBACK;
