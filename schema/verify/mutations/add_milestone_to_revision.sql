-- Verify cif:mutations/add_milestone_to_revision on pg

begin;

select cif_private.verify_function_not_present('cif', 'add_milestone_to_revision', 2);

rollback;
