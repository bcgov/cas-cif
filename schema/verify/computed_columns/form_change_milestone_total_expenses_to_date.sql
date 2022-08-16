-- Verify cif:computed_columns/form_change_milestone_total_expenses_to_date on pg

begin;

select pg_get_functiondef('cif.form_change_milestone_total_expenses_to_date(cif.form_change)'::regprocedure);

rollback;
