-- Revert cif:computed_columns/project_revision_latest_committed_form_changes_for from pg

begin;

drop function cif.project_revision_latest_committed_form_changes_for;

commit;
