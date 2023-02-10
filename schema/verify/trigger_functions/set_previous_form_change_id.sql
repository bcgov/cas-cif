-- Verify cif:trigger_functions/set_previous_form_change_id on pg

begin;

select cif_private.verify_function_not_present('cif_private', 'set_previous_form_change_id', 0);

rollback;
