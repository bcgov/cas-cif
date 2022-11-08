-- Verify cif:trigger_functions/set_user_id_001_drop_before_cif_user_update on pg

begin;

select cif_private.verify_function_not_present('cif', 'set_user_id', 0);

rollback;
