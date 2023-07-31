-- Verify cif:attachment_002_delete_permission on pg

begin;

-- cif_internal Grants
select cif_private.verify_grant('delete', 'attachment', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('delete', 'attachment', 'cif_admin');

rollback;