-- Verify cif:computed_columns/form_change_calculated_ei_performance on pg

begin;

select pg_get_functiondef('cif.form_change_calculated_ei_performance(cif.form_change)'::regprocedure);

rollback;
