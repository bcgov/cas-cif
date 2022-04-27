-- Verify cif:computed_columns/form_change_as_project_contact on pg

begin;

select pg_get_functiondef('cif.form_change_as_project_contact(cif.form_change)'::regprocedure);

rollback;
