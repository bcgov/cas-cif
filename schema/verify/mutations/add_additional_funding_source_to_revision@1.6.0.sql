-- Verify cif:mutations/add_additional_funding_source_to_revision on pg

begin;

select cif_private.verify_function_not_present('cif','add_additional_funding_source_to_revision', 2);

rollback;
