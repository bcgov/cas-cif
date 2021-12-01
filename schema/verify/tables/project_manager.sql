-- Verify cif:tables/project_manager on pg

begin;

select pg_catalog.has_table_privilege('cif.project_manager', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'project_manager', 'cif_internal');
select cif_private.verify_grant('insert', 'project_manager', 'cif_internal');
select cif_private.verify_grant('update', 'project_manager', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'project_manager', 'cif_admin');
select cif_private.verify_grant('insert', 'project_manager', 'cif_admin');
select cif_private.verify_grant('update', 'project_manager', 'cif_admin');


rollback;
