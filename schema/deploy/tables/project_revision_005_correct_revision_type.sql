-- Deploy cif:tables/project_revision_005_correct_revision_type to pg
-- requires: tables/project_revision_004_add_pending_actions_from

/**
  The create_project_revision() function was defaulting new revisions to Amendment before we had implemented the ability
  to create Amendment revisions. The revisions currently in the system should be of type 'General Revision'
**/
begin;

alter table cif.project_revision disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

update cif.project_revision set revision_type = 'General Revision' where revision_type = 'Amendment';

alter table cif.project_revision enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;

commit;
