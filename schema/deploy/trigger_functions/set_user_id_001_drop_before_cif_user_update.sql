-- Deploy cif:trigger_functions/set_user_id_001_drop_before_cif_user_update to pg
-- requires: trigger_functions/set_user_id

begin;

drop function cif_private.set_user_id;

commit;
