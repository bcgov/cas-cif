-- Verify cif:computed_columns/operator_pending_form_change_001_drop_before_cif_user_update on pg

begin;

select cif_private.verify_function_not_present('cif', 'operator_pending_form_change', 1);

rollback;
