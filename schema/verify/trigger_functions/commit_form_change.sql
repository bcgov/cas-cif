-- Verify cif:trigger_functions/commit_form_changes on pg

begin;

select cif_private.verify_function_not_present('cif_private', 'commit_form_change', 0);

rollback;
