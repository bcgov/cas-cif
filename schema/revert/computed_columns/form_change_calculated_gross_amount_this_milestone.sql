-- Revert cif:computed_columns/form_change_calculated_gross_amount_this_milestone from pg

begin;

drop function cif.form_change_calculated_gross_amount_this_milestone;

commit;
