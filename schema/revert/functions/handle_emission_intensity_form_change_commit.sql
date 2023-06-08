-- Revert cif:functions/handle_emission_intensity_form_change_commit from pg

begin;

drop function cif_private.handle_emission_intensity_form_change_commit;

commit;
