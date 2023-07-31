-- Revert cif:tables/attachment_002_delete_permission from pg

begin;

revoke delete on cif.attachment from cif_internal;
revoke delete on cif.attachment from cif_admin;


commit;