-- Revert cif:form_change_maximum_performance_milestone_amount from pg

begin;

drop function cif.form_change_maximum_performance_milestone_amount(cif.form_change);

commit;
