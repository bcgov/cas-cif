-- Revert cif:computed_columns/form_change_as_project_attachment from pg

begin;

drop function cif.form_change_as_project_attachment(cif.form_change);

commit;
