-- Deploy cif:computed_columns/project_milestone_status to pg

begin;

create or replace function cif.project_milestone_status(cif.project)
returns text as
$fn$


with upcoming_report as (
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
  milestone_reports as (
    select
            rr.submitted_date
        from
            cif.reporting_requirement rr
            join cif.report_type on report_type.name = rr.report_type
        and
            rr.project_id = $1.id
            and report_type.is_milestone
            and rr.archived_at is null
  )

  select case when
    ((select count(*) from milestone_reports) < 1)
    then 'none'

    when
      (select next_due_date
        from upcoming_report
        )::timestamptz < now()
      then 'late'
     when
      (select next_due_date
        from upcoming_report
        )::timestamptz > now()
      then 'on track'
    else 'complete'
  end;

$fn$ language sql stable;

comment on function cif.project_milestone_status(cif.project) is 'Computed column returns the status of all milestones';

commit;
