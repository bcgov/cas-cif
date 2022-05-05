-- Deploy cif:computed_columns/project_latest_committed_project_revision to pg
-- requires: tables/project
-- requires: tables/project_revision

begin;

create or replace function cif.project_latest_committed_project_revision(cif.project)
returns cif.project_revision
as
$function$
  select *
  from cif.project_revision
  where project_id = $1.id
  and change_status = 'committed'
  order by updated_at desc
  fetch first row only;
$function$ language sql stable;

comment on function cif.project_latest_committed_project_revision(cif.project) is 'Returns the latest project revision with a change_status of committed for the given project';

commit;
