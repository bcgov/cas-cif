-- Verify cif:computed_columns/form_change_total_project_value on pg

begin;

select pg_get_functiondef('cif.form_change_total_project_value(cif.form_change)'::regprocedure);

rollback;
