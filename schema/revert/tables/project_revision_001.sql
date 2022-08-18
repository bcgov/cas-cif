-- Revert cif:tables/project_revision_001 from pg

begin;

alter table cif.project drop column revision_type, drop column comments;

commit;
