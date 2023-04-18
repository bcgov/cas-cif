-- Deploy cif:computed_columns/project_pending_general_revision to pg

begin;

create function cif.project_pending_general_revision(cif.project)
returns cif.project_revision
as
$function$
  select *
  from cif.project_revision
  where project_id = $1.id
  and change_status = 'pending'
  and revision_type = 'General Revision';
$function$ language sql stable;

comment on function cif.project_pending_general_revision(cif.project) is 'Returns the pending general revision for the project';

commit;
