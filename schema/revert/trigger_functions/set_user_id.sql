-- Revert cif:trigger_functions/set_user_id from pg

begin;

drop function cif_private.set_user_id;

commit;
