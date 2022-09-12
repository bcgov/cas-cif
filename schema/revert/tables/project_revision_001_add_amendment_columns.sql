-- Revert cif:tables/project_revision_001_add_amendment_columns from pg

begin;

alter table cif.project_revision drop column revision_type, drop column comments, drop column amendment_status;

commit;
