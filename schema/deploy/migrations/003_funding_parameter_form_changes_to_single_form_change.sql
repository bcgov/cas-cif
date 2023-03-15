-- Deploy cif:migrations/003_funding_parameter_form_changes_to_single_form_change to pg

begin;

alter table cif.form_change disable trigger _100_committed_changes_are_immutable;

select cif_private.migration_funding_parameter_form_changes_to_single_form_change();

alter table cif.form_change enable trigger _100_committed_changes_are_immutable;

commit;
