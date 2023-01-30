-- Deploy cif:emission_intensity_report_calculated_ei_performance to pg
-- requires: tables/emission_intensity_report

begin;

drop function cif.emission_intensity_report_calculated_ei_performance(cif.emission_intensity_report);

commit;
