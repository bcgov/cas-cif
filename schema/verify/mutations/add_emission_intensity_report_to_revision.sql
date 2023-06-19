-- Verify cif:mutations/add_emission_intensity_report_to_revision on pg

begin;

select cif_private.verify_function_not_present('cif', 'add_emission_intensity_report_to_revision', 1);

rollback;
