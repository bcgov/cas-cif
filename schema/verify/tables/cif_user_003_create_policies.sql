-- Verify cif:tables/cif_user_003_create_policies on pg

begin;

  select cif_private.verify_policy('insert', 'cif_internal_insert_cif_user', 'cif_user', 'cif_internal');
  select cif_private.verify_policy('update', 'cif_internal_update_cif_user', 'cif_user', 'cif_internal');
  select cif_private.verify_policy('insert', 'cif_external_insert_cif_user', 'cif_user', 'cif_external');
  select cif_private.verify_policy('update', 'cif_external_update_cif_user', 'cif_user', 'cif_external');
  select cif_private.verify_policy('select', 'cif_guest_select_cif_user', 'cif_user', 'cif_guest');

rollback;
