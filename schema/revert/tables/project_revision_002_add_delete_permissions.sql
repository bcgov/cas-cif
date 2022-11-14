-- Revert cif:tables/project_revision_amendment_type_001_add_delete_permissions from pg

begin;

perform cif_private.revoke_permissions('delete', 'project_revision', 'cif_internal');
perform cif_private.revoke_permissions('delete', 'project_revision', 'cif_admin');

commit;
