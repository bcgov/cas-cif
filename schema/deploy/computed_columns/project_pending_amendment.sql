-- Deploy cif:computed_columns/project_pending_amendment to pg

begin;

create function cif.project_pending_amendment(cif.project)
returns cif.project_revision
as
$function$
  select *
  from cif.project_revision
  where project_id = $1.id
  and change_status = 'pending'
  and revision_type = 'Amendment';
$function$ language sql stable;

comment on function cif.project_pending_amendment(cif.project) is 'Returns the pending amendment for the project';

commit;
