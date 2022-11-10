-- Verify cif:tables/project_revision_amendment_type_001_delete_permissions on pg

begin;

select cif_private.verify_grant('insert', 'project_revision_amendment_type', 'cif_internal');
select cif_private.verify_grant('update', 'project_revision_amendment_type', 'cif_admin');

rollback;
