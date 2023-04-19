-- Revert cif:mutations/update_form_change from pg

begin;

drop function cif.update_form_change;

commit;
