-- Deploy cif:migrations/008_replace_bad_field_capitalization to pg

begin;

alter table cif.form_change disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

update cif.form_change
  set new_form_data = replace(new_form_data::text, 'adjustedHoldBackAmount', 'adjustedHoldbackAmount')::jsonb
  where (new_form_data->>'adjustedHoldBackAmount') is not null;

alter table cif.form_change enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;

commit;
