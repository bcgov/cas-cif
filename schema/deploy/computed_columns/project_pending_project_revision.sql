-- Deploy cif:computed_columns/project_pending_project_revision to pg

begin;

create function cif.project_pending_project_revision(cif.project)
returns cif.project_revision
as
$function$
  select *
  from cif.project_revision
  where project_id = $1.id
  and change_status = 'pending'
  and created_by = (select id from cif.cif_user where uuid = (select sub from cif.session()));
$function$ language sql stable;

comment on function cif.project_pending_project_revision(cif.project) is 'Returns the pending project revision for the project, created by the current user';

commit;
