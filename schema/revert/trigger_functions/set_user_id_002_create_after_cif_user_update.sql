-- Revert cif:trigger_functions/set_user_id_002_create_after_cif_user_update from pg

begin;

drop function cif_private.set_user_id;

commit;
