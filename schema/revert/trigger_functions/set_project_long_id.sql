-- Revert cif:trigger_functions/set_project_long_id from pg

begin;

drop function cif_private.set_project_long_id;

commit;
