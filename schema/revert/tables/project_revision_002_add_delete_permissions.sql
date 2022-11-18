-- Revert cif:tables/project_revision_amendment_type_001_add_delete_permissions from pg

begin;

revoke delete on cif.project_revision from cif_internal, cif_admin;

commit;
