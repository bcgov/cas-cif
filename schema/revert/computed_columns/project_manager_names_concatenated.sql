-- Revert cif:computed_columns/project_manager_names_concatenated from pg

begin;

drop function cif.project_manager_names_concatenated;

commit;
