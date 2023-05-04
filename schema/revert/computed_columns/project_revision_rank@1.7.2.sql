-- Revert cif:computed_columns/project_revision_rank from pg

begin;

drop function cif.project_revision_rank;

commit;
