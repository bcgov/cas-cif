-- Verify cif:computed_columns/form_change_calculated_total_payment_amount_to_date on pg

begin;

select pg_get_functiondef('cif.form_change_calculated_total_payment_amount_to_date(cif.form_change)'::regprocedure);

rollback;
