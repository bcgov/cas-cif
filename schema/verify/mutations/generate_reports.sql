-- Verify cif:mutations/generate_reports on pg

begin;

select cif_private.verify_function_not_present('cif', 'generate_reports', 4);

rollback;
