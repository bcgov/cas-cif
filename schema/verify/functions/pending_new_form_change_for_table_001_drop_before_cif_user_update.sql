-- Verify cif:functions/pending_new_form_change_for_table_001_drop_before_cif_user_update on pg

begin;

select cif_private.verify_function_not_present('cif', 'pending_new_form_change_for_table', 1);

rollback;
