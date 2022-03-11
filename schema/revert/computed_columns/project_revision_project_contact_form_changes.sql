-- Revert cif:computed_columns/project_revision_project_contact_form_changes from pg

begin;

drop function cif.project_revision_project_contact_form_changes;

commit;
