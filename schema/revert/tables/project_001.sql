-- Revert cif:tables/project_001 from pg

begin;

alter table cif.project drop column score, drop column project_type;

commit;
