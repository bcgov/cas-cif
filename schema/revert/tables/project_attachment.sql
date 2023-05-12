-- Revert cif:tables/project_attachment from pg

begin;

drop table cif.project_attachment;

commit;
