-- Revert cif:computed_columns/form_change_as_project_contact from pg

begin;

drop function cif.form_change_as_project_contact(cif.form_change);

commit;
