-- Verify cif:tables/project_manager_label on pg

begin;

select pg_catalog.has_table_privilege('cif.project_manager_label', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'project_manager_label', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'project_manager_label', 'cif_admin');
select cif_private.verify_grant('insert', 'project_manager_label', 'cif_admin');
select cif_private.verify_grant('update', 'project_manager_label', 'cif_admin');


rollback;
