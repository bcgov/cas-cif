-- Revert cif:tables/project_revision_002_set_amendment_statuses from pg

begin;

alter table cif.project_revision alter column amendment_status drop default;

commit;
