-- Verify cif:computed_columns/form_change_calculated_gross_amount_this_milestone on pg

begin;

select pg_get_functiondef('cif.form_change_calculated_gross_amount_this_milestone(cif.form_change)'::regprocedure);

rollback;
