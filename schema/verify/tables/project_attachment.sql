-- Verify cif:tables/project_attachment on pg

begin;

select pg_catalog.has_table_privilege('cif.project_attachment', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'project_attachment', 'cif_internal');
select cif_private.verify_grant('insert', 'project_attachment', 'cif_internal');
select cif_private.verify_grant('update', 'project_attachment', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'project_attachment', 'cif_admin');
select cif_private.verify_grant('insert', 'project_attachment', 'cif_admin');
select cif_private.verify_grant('update', 'project_attachment', 'cif_admin');

rollback;
