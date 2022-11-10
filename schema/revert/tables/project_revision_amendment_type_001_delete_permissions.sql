-- Revert cif:tables/project_revision_amendment_type_001_delete_permissions from pg

begin;

perform cif_private.revoke_permissions('delete', 'project_revision_amendment_type', 'cif_internal');
perform cif_private.revoke_permissions('delete', 'project_revision_amendment_type', 'cif_admin');

commit;
