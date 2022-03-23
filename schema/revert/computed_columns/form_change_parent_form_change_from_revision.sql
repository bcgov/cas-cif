-- Revert cif:functions/form_change_parent_form_change_from_revision from pg

begin;

drop function cif.form_change_parent_form_change_from_revision;

commit;
