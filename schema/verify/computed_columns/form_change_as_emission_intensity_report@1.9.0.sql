-- Verify cif:computed_columns/form_change_as_emission_intensity_report on pg

begin;

select pg_get_functiondef('cif.form_change_as_emission_intensity_report(cif.form_change)'::regprocedure);

commit;
