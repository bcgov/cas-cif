-- Revert cif:computed_columns/form_change_calculated_total_payment_amount_to_date from pg

begin;

drop function cif.form_change_calculated_total_payment_amount_to_date;

commit;
