-- Revert cif:computed_columns/project_revision_form_changes_for from pg

begin;

drop function cif.project_revision_form_changes_for;

commit;
