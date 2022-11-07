-- Deploy cif:tables/cif_user_003_create_policies to pg
-- requires: tables/cif_user

begin;

  do
  $policy$
  begin
  -- cif_internal RLS: can see all users, but can only modify its own record
  perform cif_private.upsert_policy('cif_internal_insert_cif_user', 'cif_user', 'insert', 'cif_internal', 'session_sub=(select sub from cif.session())');
  perform cif_private.upsert_policy('cif_internal_update_cif_user', 'cif_user', 'update', 'cif_internal', 'session_sub=(select sub from cif.session())');

  -- cif_external RLS: can see all users, but can only modify its own record
  perform cif_private.upsert_policy('cif_external_insert_cif_user', 'cif_user', 'insert', 'cif_external', 'session_sub=(select sub from cif.session())');
  perform cif_private.upsert_policy('cif_external_update_cif_user', 'cif_user', 'update', 'cif_external', 'session_sub=(select sub from cif.session())');

  -- cif_guest RLS: can only see its own (empty) record
  perform cif_private.upsert_policy('cif_guest_select_cif_user', 'cif_user', 'select', 'cif_guest', 'session_sub=(select sub from cif.session())');

  end
  $policy$;

commit;
