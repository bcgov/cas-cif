-- Deploy cif:tables/cif_user_001_drop_policies to pg
-- requires: tables/cif_user

begin;

  drop policy cif_internal_insert_cif_user on cif.cif_user;
  drop policy cif_internal_update_cif_user on cif.cif_user;
  drop policy cif_external_insert_cif_user on cif.cif_user;
  drop policy cif_external_update_cif_user on cif.cif_user;
  drop policy cif_guest_select_cif_user on cif.cif_user;

commit;
