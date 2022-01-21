-- Revert cif:tables/project_contact from pg

begin;

drop table cif.project_contact;

commit;
