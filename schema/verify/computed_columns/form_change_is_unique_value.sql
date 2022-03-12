-- Verify cif:computed_columns/form_change_is_unique_value on pg

begin;

select pg_get_functiondef('cif.form_change_is_unique_value(cif.form_change, text)'::regprocedure);

rollback;
