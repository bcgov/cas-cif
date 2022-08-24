-- Revert cif:mutations/stage_form_change from pg

begin;

drop function cif.stage_form_change;

commit;
