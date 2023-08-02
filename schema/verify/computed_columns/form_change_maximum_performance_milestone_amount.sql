-- Verify cif:form_change_maximum_performance_milestone_amount on pg

begin;

select pg_get_functiondef('cif.form_change_maximum_performance_milestone_amount(cif.form_change)'::regprocedure);

rollback;
