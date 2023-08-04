-- Deploy cif:migrations/009_rebuild_project_summary_history to pg

begin;

  alter table cif.form_change disable trigger _100_committed_changes_are_immutable, disable trigger _set_previous_form_change_id, disable trigger _100_timestamps;

  select cif_private.migration_rebuild_project_summary_report_history();

  alter table cif.form_change enable trigger _100_committed_changes_are_immutable, enable trigger _set_previous_form_change_id, enable trigger _100_timestamps;

commit;
