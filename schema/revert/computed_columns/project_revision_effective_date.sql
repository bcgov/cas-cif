-- Revert cif:computed_columns/project_revision_effective_date from pg

begin;

drop function cif.project_revision_effective_date;

commit;
