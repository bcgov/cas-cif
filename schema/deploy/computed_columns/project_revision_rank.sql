-- Deploy cif:computed_columns/project_revision_rank to pg

begin;

drop function cif.project_revision_rank(project_revision cif.project_revision);

commit;
