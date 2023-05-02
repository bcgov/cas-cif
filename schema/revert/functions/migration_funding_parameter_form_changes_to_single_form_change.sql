-- -- Deploy cif:functions/migration_funding_parameter_form_changes_to_single_form_change to pg

begin;

drop function cif_private.migration_funding_parameter_form_changes_to_single_form_change;

commit;
