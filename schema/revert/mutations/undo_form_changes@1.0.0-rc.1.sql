-- Revert cif:mutations/undo_form_changes from pg

begin;

drop function cif.undo_form_changes;

commit;
