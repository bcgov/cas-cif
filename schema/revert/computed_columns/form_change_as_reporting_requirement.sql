-- Revert cif:computed_columns/form_change_as_reporting_requirement from pg

begin;

drop function cif.form_change_as_reporting_requirement(cif.form_change);

commit;
