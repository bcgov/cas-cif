-- Revert cif:trigger_functions/operator_swrs_organisation_is_immutable from pg

begin;

drop function cif_private.operator_swrs_organisation_is_immutable;

commit;
