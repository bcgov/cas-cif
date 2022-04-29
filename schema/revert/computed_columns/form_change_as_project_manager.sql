-- Revert cif:computed_columns/form_change_as_project_manager from pg

begin;

drop function cif.form_change_as_project_manager(cif.form_change);

commit;
