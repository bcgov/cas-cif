-- Revert cif:tables/project_revision_004_add_pending_actions_from from pg

begin;

alter table cif.project_revision alter column pending_actions_from drop default;

commit;
