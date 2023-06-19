-- Verify cif:mutations/add_emission_intensity_report_to_revision on pg

begin;

select pg_get_functiondef('cif.add_emission_intensity_report_to_revision(int)'::regprocedure);

rollback;
