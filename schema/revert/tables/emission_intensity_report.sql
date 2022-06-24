-- Revert cif:tables/emission_intensity_report from pg

begin;

drop table cif.emission_intensity_report;

commit;
