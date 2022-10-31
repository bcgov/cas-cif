-- Revert cif:mutations/discard_milestone_form_change from pg

begin;

drop function cif.discard_milestone_form_change;

commit;
