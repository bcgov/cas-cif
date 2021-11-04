-- Revert cif:tables/project from pg

begin;

drop table cif.project;

commit;