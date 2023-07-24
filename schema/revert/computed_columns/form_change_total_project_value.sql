-- Revert cif:computed_columns/form_change_total_project_value from pg

begin;

drop function cif.form_change_total_project_value;

commit;
