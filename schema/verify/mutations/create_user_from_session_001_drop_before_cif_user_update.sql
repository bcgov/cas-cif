-- Verify cif:mutations/create_user_from_session_001_drop_before_cif_user_update on pg

begin;

select cif_private.verify_function_not_present('cif', 'create_user_from_session', 0);

rollback;
