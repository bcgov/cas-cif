-- Verify cif:functions/handle_emission_intensity_form_change_commit on pg

begin;

select pg_get_functiondef('cif_private.handle_emission_intensity_form_change_commit(cif.form_change)'::regprocedure);

rollback;
