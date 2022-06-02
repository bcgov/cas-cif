-- Deploy cif:computed_columns/project_revision_milestone_report_statuses to pg
-- requires: tables/form_change

begin;

create or replace function cif.project_revision_milestone_report_statuses(cif.project_revision)
returns setof cif.milestone_report_status_return
as
$function$

  -- Get individual milestone statuses
  select
    (fc.new_form_data ->> 'reportingRequirementIndex')::int as milestone_index, fc.new_form_data ->> 'status' as reporting_requirement_status,
    case
      when fc.change_status = 'pending'
        and (select cif.form_change_is_pristine((select row(form_change.*)::cif.form_change from cif.form_change where id=fc.id)) is distinct from true)
        then  'In Progress'
      when fc.change_status= 'staged'
        and json_array_length(fc.validation_errors::json) = 0
        and (select cif.form_change_is_pristine((select row(form_change.*)::cif.form_change from cif.form_change where id=fc.id)) is distinct from true)
        then 'Filled'
      when fc.change_status= 'staged'
        and json_array_length(fc.validation_errors::json) > 0
        then 'Attention Required'
      else 'Not Started'
    end
  from cif.form_change fc
  where fc.project_revision_id = $1.id
  and fc.form_data_table_name = 'reporting_requirement'
  and fc.new_form_data ->> 'reportType' in ('General Milestone', 'Advanced Milestone', 'Performance Milestone', 'Reporting Milestone')
  -- Get an overall status ('late' if any individual milestones are late, otherwise 'on_track')
  -- Indexed as -1 to always be the first record returned by the function
  union
    select 0,
    (select coalesce((
      select distinct fc.new_form_data ->> 'status'
      from cif.form_change fc
      where fc.project_revision_id = $1.id
      and fc.form_data_table_name = 'reporting_requirement'
      and fc.new_form_data ->> 'reportType' in ('General Milestone', 'Advanced Milestone', 'Performance Milestone', 'Reporting Milestone')
      and fc.new_form_data ->> 'status' = 'late'
    ), 'on_track')), null
  order by milestone_index;

$function$ language sql stable;

grant execute on function cif.project_revision_milestone_report_statuses to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_milestone_report_statuses is 'Computed column to return both form completion statuses and reporting requirement statuses for individual milestones as well as an overall reporting requirement status';

commit;
