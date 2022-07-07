-- Revert cif:computed_columns/reporting_requirement_has_expenses from pg

begin;

drop function cif.reporting_requirement_has_expenses;

commit;
