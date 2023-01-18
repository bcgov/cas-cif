-- Revert cif:mutations/update_milestone_form_change from pg

begin;

drop function cif.update_milestone_form_change;

commit;
