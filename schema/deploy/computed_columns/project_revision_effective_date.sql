-- Deploy cif:computed_columns/project_revision_effective_date to pg

begin;

create function cif.project_revision_effective_date(cif.project_revision)
returns timestamptz
as
$function$
  select
    case
      when $1.change_status = 'committed'
        then $1.updated_at
      else null
  end
$function$ language sql stable;

comment on function cif.project_revision_effective_date(cif.project_revision) is 'Returns the timestamptz for updated_at if the change_status is committed, otherwise null';

commit;
