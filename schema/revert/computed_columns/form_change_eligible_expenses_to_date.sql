-- Revert cif:computed_columns/form_change_eligible_expenses_to_date from pg

begin;

drop function cif.form_change_eligible_expenses_to_date(cif.form_change);

commit;
