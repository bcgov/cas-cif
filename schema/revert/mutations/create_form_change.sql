-- Revert cif:mutations/create_form_change from pg

begin;

drop function cif.create_form_change;

commit;
