-- Verify cif:computed_columns/form_change_holdback_amount_to_date_001 on pg

begin;

select pg_get_functiondef('cif.form_change_holdback_amount_to_date(cif.form_change)'::regprocedure);

rollback;
