-- Revert cif:trigger_functions/discard_project_revision from pg

begin;

drop function cif_private.discard_project_revision;

commit;
