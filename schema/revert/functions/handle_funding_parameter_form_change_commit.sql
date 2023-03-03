-- Revert cif:functions/handle_funding_parameter_form_change_commit from pg

begin;

drop function cif_private.handle_funding_parameter_form_change_commit;

commit;
