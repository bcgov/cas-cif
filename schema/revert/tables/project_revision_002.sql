-- Revert cif:tables/project_revision_002.sql from pg

begin;

alter table cif.project_revision drop column amendment_status;

commit;
