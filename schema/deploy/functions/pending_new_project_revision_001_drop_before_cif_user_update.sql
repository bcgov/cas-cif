-- Deploy cif:functions/pending_new_project_revision_001_drop_before_cif_user_update to pg
-- requires: functions/pending_new_project_revision

begin;

drop function cif.pending_new_project_revision;

commit;
