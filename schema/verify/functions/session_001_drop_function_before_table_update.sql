-- Verify cif:functions/session_001_drop_function_before_table_update on pg

begin;

select cif_private.verify_function_not_present('cif', 'session', 0);

rollback;
