-- Revert cif:mutations/discard_funding_parameter_form_change from pg

begin;

drop function cif.discard_funding_parameter_form_change;

commit;
