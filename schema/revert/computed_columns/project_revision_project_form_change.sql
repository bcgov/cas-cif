-- Revert cif:computed_columns/project_revision_project_form_change.sql from pg

begin;

drop function cif.project_revision_project_form_change;

commit;
