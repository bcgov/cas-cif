-- Revert cif:computed_columns/form_change_reporting_requirement_status from pg

begin;

drop function cif.form_change_reporting_requirement_status;

commit;
