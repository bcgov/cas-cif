-- Revert cif:mutations/discard_emission_intensity_report from pg

begin;

drop function cif.discard_emission_intensity_report;

commit;

