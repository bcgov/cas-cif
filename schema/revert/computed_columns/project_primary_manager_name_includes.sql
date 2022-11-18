-- Revert cif:computed_columns/project_primary_manager_name_includes from pg

begin;

drop function cif.project_primary_manager_name_includes;

commit;
