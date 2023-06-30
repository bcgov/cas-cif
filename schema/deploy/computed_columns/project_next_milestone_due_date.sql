-- Deploy cif:computed_columns/project_next_milestone_due_date to pg

begin;

create or replace function cif.project_next_milestone_due_date(cif.project)
returns timestamptz
as
$function$
    with upcoming as (
        select
                min(rr.report_due_date) as next_due_date
            from
                cif.reporting_requirement rr
                join cif.report_type on report_type.name = rr.report_type
            and
                rr.project_id = $1.id
                and report_type.is_milestone
                and rr.submitted_date is null
                and rr.archived_at is null
            ),
    last_submitted as (
        select
                max(rr.report_due_date) as last_submitted_date
            from
                cif.reporting_requirement rr
                join cif.report_type on report_type.name = rr.report_type
            and
                rr.project_id = $1.id
                and report_type.is_milestone
                and rr.submitted_date is not null
                and rr.archived_at is null
    )
    select coalesce(
        (select next_due_date from upcoming),
        (select last_submitted_date from last_submitted)
    );

$function$ language sql stable;

comment on function cif.project_next_milestone_due_date(cif.project) is 'Computed column to return the next milestone due date for a given project';

commit;
