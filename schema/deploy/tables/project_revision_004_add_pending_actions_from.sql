-- Deploy cif:tables/project_revision_004_add_pending_actions_from to pg

begin;

alter table cif.project_revision disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

alter table cif.project_revision
add column pending_actions_from varchar(1000);
comment on column cif.project_revision.pending_actions_from is 'Pending actions from (e.g. Director)';

alter table cif.project_revision enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;
commit;
