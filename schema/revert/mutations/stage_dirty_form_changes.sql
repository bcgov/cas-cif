-- Revert cif:mutations/stage_dirty_form_changes from pg

begin;

drop function cif.stage_dirty_form_changes;

commit;
