-- Revert cif:emission_intensity_report_calculated_ei_performance from pg

begin;

drop function cif.emission_intensity_report_calculated_ei_performance(cif.emission_intensity_report);

commit;
