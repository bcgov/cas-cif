-- Deploy cif:tables/project_revision_amendment_type_001_add_delete_permissions to pg

begin;

do
$grant$
begin

perform cif_private.grant_permissions('delete', 'project_revision_amendment_type', 'cif_internal');
perform cif_private.grant_permissions('delete', 'project_revision_amendment_type', 'cif_admin');

end
$grant$;

commit;
