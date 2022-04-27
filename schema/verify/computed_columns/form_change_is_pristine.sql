-- Verify cif:form_change_is_pristine on pg

begin;

select pg_get_functiondef('cif.form_change_is_pristine(cif.form_change)'::regprocedure);

rollback;
