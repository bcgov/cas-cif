-- Verify cif:emission_intensity_report_calculated_ei_performance on pg

begin;

select cif_private.verify_function_not_present('cif', 'emission_intensity_report_calculated_ei_performance', 1);

rollback;
