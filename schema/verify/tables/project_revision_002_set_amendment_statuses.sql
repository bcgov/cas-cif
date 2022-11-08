-- Verify cif:tables/project_revision_002_set_amendment_statuses on pg

begin;

select pg_catalog.has_table_privilege('cif.project_revision', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'project_revision', 'cif_internal');
select cif_private.verify_grant('insert', 'project_revision', 'cif_internal');
select cif_private.verify_grant('update', 'project_revision', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'project_revision', 'cif_admin');
select cif_private.verify_grant('insert', 'project_revision', 'cif_admin');
select cif_private.verify_grant('update', 'project_revision', 'cif_admin');

rollback;
