-- Revert cif:mutations/discard_additional_funding_source_form_change from pg

begin;

drop function cif.discard_additional_funding_source_form_change;

commit;
