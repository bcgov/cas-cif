-- Verify cif:tables/cif_user_001_drop_policies on pg

begin;

  select cif_private.verify_policy_not_present('cif_internal_insert_cif_user', 'cif.cif_user');
  select cif_private.verify_policy_not_present('cif_internal_update_cif_user', 'cif.cif_user');
  select cif_private.verify_policy_not_present('cif_external_insert_cif_user', 'cif.cif_user');
  select cif_private.verify_policy_not_present('cif_external_update_cif_user', 'cif.cif_user');
  select cif_private.verify_policy_not_present('cif_guest_select_cif_user', 'cif.cif_user');

rollback;
