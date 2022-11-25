-- Revert cif:trigger_functions/cif_user_session_sub_immutable_with_flag from pg

begin;

drop function cif_private.cif_user_session_sub_immutable_with_flag_set;

commit;
