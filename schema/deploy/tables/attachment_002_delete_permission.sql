-- Deploy cif:attachment_002_delete_permission to pg

begin;

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('delete', 'attachment', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('delete', 'attachment', 'cif_admin');

end
$grant$;

commit;