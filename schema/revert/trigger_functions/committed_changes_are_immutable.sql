-- Revert cif:trigger_functions/committed_changes_are_immutable from pg

begin;

drop function cif_private.committed_changes_are_immutable;

commit;
