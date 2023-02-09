-- Deploy cif:computed_columns/project_next_milestone_due_date to pg

begin;

create function cif.project_next_milestone_due_date(cif.project)
returns timestamptz
as
$function$
    select
        min(reporting_requirement.report_due_date)
    from
        cif.reporting_requirement
    where
        reporting_requirement.project_id = $1.id
        and reporting_requirement.report_type = 'General Milestone';

$function$ language sql stable;

comment on function cif.project_next_milestone_due_date(cif.project) is 'Computed column to return the next milestone due date for a given project';

commit;
