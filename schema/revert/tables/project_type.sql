-- Revert cif:tables/project_type from pg

begin;

drop table cif.project_type;

commit;
