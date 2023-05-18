-- Revert cif:computed_columns/form_change_actual_performance_milestone_amount from pg

begin;

drop function cif.form_change_actual_performance_milestone_amount(cif.form_change);

commit;
