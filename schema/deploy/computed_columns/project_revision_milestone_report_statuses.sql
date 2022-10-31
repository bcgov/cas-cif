-- Deploy cif:computed_columns/project_revision_milestone_report_statuses to pg
-- requires: tables/form_change

begin;

create or replace function cif.project_revision_milestone_report_statuses(project_revision cif.project_revision)
returns setof cif.milestone_report_status_return
as
$function$

  -- Get individual milestone statuses
  select
    (fc.new_form_data ->> 'reportingRequirementIndex')::int as milestone_index,
    (fc.new_form_data ->> 'reportDueDate')::timestamptz as report_due_date,
    (fc.new_form_data ->> 'submittedDate')::timestamptz as report_due_date,
    case
      when fc.change_status = 'pending'
        and
          (select cif.form_change_is_pristine((select row(form_change.*)::cif.form_change from cif.form_change where id=fc.id)) is distinct from true)
        then  'In Progress'
      when fc.change_status= 'staged'
        and json_array_length(fc.validation_errors::json) = 0
        and
          (select cif.form_change_is_pristine((select row(form_change.*)::cif.form_change from cif.form_change where id=fc.id)) is distinct from true)
        then 'Filled'
      when fc.change_status= 'staged'
        and
          json_array_length(fc.validation_errors::json) > 0
        then 'Attention Required'
      else
        case
          when ($1.is_first_revision)
            then 'Not Started'
          else 'No Changes'
        end
    end
  from cif.form_change fc
  where fc.project_revision_id = $1.id
  and fc.form_data_table_name = 'reporting_requirement'
  and fc.new_form_data ->> 'reportType' in ((select name from cif.report_type where is_milestone = true))
  and fc.operation != 'archive'
  order by milestone_index;

$function$ language sql stable;

grant execute on function cif.project_revision_milestone_report_statuses to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_milestone_report_statuses is 'Computed column to return both form completion statuses and reporting requirement statuses for individual milestones';

commit;
