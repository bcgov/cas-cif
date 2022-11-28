-- Revert cif:computed_columns/project_primary_managers from pg

begin;

drop function cif.project_primary_managers;

commit;
