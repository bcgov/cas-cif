-- Revert cif:trigger_functions/archived_records_are_immutable from pg

begin;

drop function cif_private.archived_records_are_immutable;

commit;
