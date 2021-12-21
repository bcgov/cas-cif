-- Revert cif:tables/project_revision from pg

begin;

drop table cif.project_revision;

commit;
