-- Verify cif:tables/cif_user on pg

begin;

select pg_catalog.has_table_privilege('cif.cif_user', 'select');


-- cif_admin Grants
select cif_private.verify_grant('select', 'cif_user', 'cif_internal');
select cif_private.verify_grant('insert', 'cif_user', 'cif_internal');
select cif_private.verify_grant('update', 'cif_user', 'cif_internal',
  ARRAY['first_name', 'last_name', 'email_address', 'created_at', 'created_by', 'updated_at', 'updated_by', 'archived_at', 'archived_by']);

-- cif_admin Grants
select cif_private.verify_grant('select', 'cif_user', 'cif_external');
select cif_private.verify_grant('insert', 'cif_user', 'cif_external');
select cif_private.verify_grant('update', 'cif_user', 'cif_external',
  ARRAY['first_name', 'last_name', 'email_address', 'created_at', 'created_by', 'updated_at', 'updated_by', 'archived_at', 'archived_by']);

-- cif_admin Grants
select cif_private.verify_grant('select', 'cif_user', 'cif_admin');
select cif_private.verify_grant('insert', 'cif_user', 'cif_admin');
select cif_private.verify_grant('update', 'cif_user', 'cif_admin',
  ARRAY['first_name', 'last_name', 'email_address', 'created_at', 'created_by', 'updated_at', 'updated_by', 'archived_at', 'archived_by']);


-- cif_guest grant
select cif_private.verify_grant('select', 'cif_user', 'cif_guest');

rollback;
