-- Revert cif:mutations/add_emission_intensity_report_to_revision from pg

begin;

drop function cif.add_emission_intensity_report_to_revision;

commit;
