-- Deploy cif:migrations/002_form_change_set_original_parent_form_change_id to pg

begin;

  alter table cif.form_change disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

  select cif_private.migration_set_original_parent_form_change_id();

  alter table cif.form_change enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;

end;
