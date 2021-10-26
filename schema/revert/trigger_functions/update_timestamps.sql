-- Revert cif:trigger_functions/update_timestamps from pg

begin;

drop function cif_private.update_timestamps();

commit;
