-- Revert cif:computed_columns/form_change_calculated_ei_performance from pg

begin;

drop function cif.form_change_calculated_ei_performance(fc cif.form_change);

commit;
