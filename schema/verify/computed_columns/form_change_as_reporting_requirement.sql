-- Verify cif:computed_columns/form_change_as_reporting_requirement on pg

begin;

select pg_get_functiondef('cif.form_change_as_reporting_requirement(cif.form_change)'::regprocedure);

rollback;
