-- Revert cif:computed_columns/form_change_as_emission_intensity_report from pg

begin;


drop function cif.form_change_as_emission_intensity_report(cif.form_change);

commit;
