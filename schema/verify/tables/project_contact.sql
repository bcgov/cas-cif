-- Verify cif:tables/project_contact on pg

begin;

select pg_catalog.has_table_privilege('cif.project_contact', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'project_contact', 'cif_internal');
select cif_private.verify_grant('insert', 'project_contact', 'cif_internal');
select cif_private.verify_grant('update', 'project_contact', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'project_contact', 'cif_admin');
select cif_private.verify_grant('insert', 'project_contact', 'cif_admin');
select cif_private.verify_grant('update', 'project_contact', 'cif_admin');


rollback;
