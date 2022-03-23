-- Verify cif:functions/form_change_parent_form_change_from_revision on pg

begin;

select pg_get_functiondef('cif.form_change_parent_form_change_from_revision(cif.form_change, integer)'::regprocedure);

rollback;
