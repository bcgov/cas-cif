-- Verify cif:mutations/discard_milestone_form_change on pg

begin;

select cif_private.verify_function_not_present('cif', 'discard_milestone_form_change', 2);

rollback;
