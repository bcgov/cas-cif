-- Deploy cif:functions/pending_new_project_revision_002_create_after_cif_user_update to pg
-- requires: functions/pending_new_project_revision_001_drop_before_cif_user_update

begin;

create or replace function cif.pending_new_project_revision() returns cif.project_revision as
$$
  select * from cif.project_revision
  where project_id is null
  and created_by = (select id from cif.cif_user where session_sub = (select sub from cif.session()))
  limit 1;
$$ language 'sql' stable;

comment on function cif.pending_new_project_revision() is
  'returns a project_revision for a new project in the pending state for the current user, i.e. allows to resume a project creation';

commit;
