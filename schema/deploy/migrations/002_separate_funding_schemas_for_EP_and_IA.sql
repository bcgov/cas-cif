-- Deploy cif:migrations/002_separate_funding_schemas_for_EP_and_IA to pg

begin;

alter table cif.form_change disable trigger _100_committed_changes_are_immutable;

select cif_private.funding_form_changes_to_separate_schemas();

alter table cif.form_change enable trigger _100_committed_changes_are_immutable;

commit;
