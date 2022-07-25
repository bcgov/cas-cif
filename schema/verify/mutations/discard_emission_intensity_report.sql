-- Verify cif:mutations/discard_emission_intensity_report on pg

begin;

select pg_get_functiondef('cif.discard_emission_intensity_report(int)'::regprocedure);

rollback;
