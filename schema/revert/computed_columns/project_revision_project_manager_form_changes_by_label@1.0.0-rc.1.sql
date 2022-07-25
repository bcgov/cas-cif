-- Revert cif:computed_columns/project_revision_project_manager_form_changes_by_label from pg

begin;

drop function cif.project_revision_project_manager_form_changes_by_label;

commit;
