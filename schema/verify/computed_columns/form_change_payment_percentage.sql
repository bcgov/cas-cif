-- Verify cif:computed_column/form_change_payment_percentage on pg

begin;

select pg_get_functiondef('cif.form_change_payment_percentage(cif.form_change)'::regprocedure);

rollback;
