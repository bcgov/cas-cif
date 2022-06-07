-- Verify cif:computed_columns/form_change_reporting_requirement_status on pg

begin;

select pg_get_functiondef('cif.form_change_reporting_requirement_status(cif.form_change)'::regprocedure);

rollback;
