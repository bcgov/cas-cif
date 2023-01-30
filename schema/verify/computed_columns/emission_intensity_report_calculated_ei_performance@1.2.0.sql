-- Verify cif:emission_intensity_report_calculated_ei_performance on pg

begin;

select pg_get_functiondef('cif.emission_intensity_report_calculated_ei_performance(cif.emission_intensity_report)'::regprocedure);

rollback;
