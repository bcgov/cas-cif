-- Revert cif:trigger_functions/deleted_records_are_immutable from pg

begin;

drop function cif_private.deleted_records_are_immutable;

commit;
