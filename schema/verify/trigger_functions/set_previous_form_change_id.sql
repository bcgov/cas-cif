-- Verify cif:trigger_functions/set_previous_form_change_id on pg

begin;

select pg_get_functiondef('cif_private.set_previous_form_change_id()'::regprocedure);

rollback;
