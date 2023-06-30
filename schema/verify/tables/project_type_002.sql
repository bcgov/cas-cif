-- Verify cif:tables/project_type_002 on pg

begin;

select pg_catalog.has_table_privilege('cif.project_type', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'project_type', 'cif_internal');
select cif_private.verify_grant('insert', 'project_type', 'cif_internal');
select cif_private.verify_grant('update', 'project_type', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'project_type', 'cif_admin');
select cif_private.verify_grant('insert', 'project_type', 'cif_admin');
select cif_private.verify_grant('update', 'project_type', 'cif_admin');

rollback;
