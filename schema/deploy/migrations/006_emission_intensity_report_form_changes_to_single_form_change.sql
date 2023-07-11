-- Deploy cif:migrations/006_emission_intensity_report_form_changes_to_single_form_change to pg


begin;

alter table cif.form_change disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

select cif_private.migration_emission_intensity_report_form_changes_to_single_form_change();

alter table cif.form_change enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;

commit;
