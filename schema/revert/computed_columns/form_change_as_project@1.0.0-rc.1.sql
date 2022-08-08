-- Revert cif:computed_columns/form_change_as_project from pg

begin;

drop function cif.form_change_as_project(cif.form_change);

commit;
