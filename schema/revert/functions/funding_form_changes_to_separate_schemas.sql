-- Revert cif:functions/funding_form_changes_to_separate_schemas from pg

begin;

drop function cif_private.funding_form_changes_to_separate_schemas;

commit;
