-- Revert cif:tables/project_manager from pg

begin;

drop table cif.project_manager;

commit;
