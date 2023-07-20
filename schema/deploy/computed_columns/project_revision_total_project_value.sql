-- Deploy cif:computed_columns/project_revision_total_project_value to pg

begin;

drop function cif.project_revision_total_project_value;
-- Depricated see: form_change_total_project_value

commit;
