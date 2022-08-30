-- Verify cif:tables/project_revision_amendment_type on pg

begin;

select pg_catalog.has_table_privilege('cif.project_revision_amendment_type', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'project_revision_amendment_type', 'cif_internal');
select cif_private.verify_grant('update', 'project_revision_amendment_type', 'cif_internal');
select cif_private.verify_grant('insert', 'project_revision_amendment_type', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'project_revision_amendment_type', 'cif_admin');
select cif_private.verify_grant('insert', 'project_revision_amendment_type', 'cif_admin');
select cif_private.verify_grant('update', 'project_revision_amendment_type', 'cif_admin');

rollback;
