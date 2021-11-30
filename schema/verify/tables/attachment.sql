-- Verify cif:tables/attachment on pg

BEGIN;

select pg_catalog.has_table_privilege('cif.attachment', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'attachment', 'cif_internal');
select cif_private.verify_grant('insert', 'attachment', 'cif_internal');
select cif_private.verify_grant('update', 'attachment', 'cif_admin',
  ARRAY['file', 'file_name']);

-- cif_admin Grants
select cif_private.verify_grant('select', 'attachment', 'cif_admin');
select cif_private.verify_grant('insert', 'attachment', 'cif_admin');
select cif_private.verify_grant('update', 'attachment', 'cif_admin',
  ARRAY['file', 'file_name']);

ROLLBACK;
