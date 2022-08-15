-- Verify cif:computed_columns/form_change_as_additional_funding_source on pg

begin;

select pg_get_functiondef('cif.form_change_as_additional_funding_source(cif.form_change)'::regprocedure);

rollback;
