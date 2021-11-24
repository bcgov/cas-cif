-- Verify cif:trigger_functions/save_form_changes on pg

begin;

select pg_get_functiondef('cif_private.save_form_change()'::regprocedure);

rollback;
