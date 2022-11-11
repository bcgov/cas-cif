-- Deploy cif:mutations/generate_quarterly_reports to pg

begin;

create or replace function cif.generate_quarterly_reports(revision_id int, start_date timestamptz, end_date timestamptz)
  returns setof cif.form_change as
  $generate_quarterly_reports$
declare
  start_date_year int := extract(year from $2);
  report_interval_start_date timestamptz;
begin
  if $2 >= $3 then
      raise exception 'start_date must be before end_date';
  end if;

  -- choosing the closest quarter start date from a list of possible dates as a temporary table
  select * from generate_series(make_date(start_date_year, 01, 05), make_date(start_date_year + 1, 01, 05), '3 month'::interval) as quarterly_report_due_date
    where $2 <= quarterly_report_due_date limit 1 into report_interval_start_date;

  return query
  with report_form_changes as (
    insert into cif.form_change(
        new_form_data,
        operation,
        form_data_schema_name,
        form_data_table_name,
        json_schema_name,
        project_revision_id
    )
    (select
      json_build_object(
        'projectId', (select form_data_record_id from cif.form_change where form_data_table_name='project' and project_revision_id=$1),
        'reportType', 'Quarterly',
        'reportDueDate', due_date::timestamptz,
        'reportingRequirementIndex', row_number() over()
      ),
      'create',
      'cif',
      'reporting_requirement',
      'reporting_requirement',
      $1
      -- setting the `report_interval_start_date` to the end of the day to make sure we have the correct date on the front end (the front end is using the end of the day to display the date)
      from generate_series(date_trunc('day', report_interval_start_date::timestamptz) + interval '1 day' - interval '1 second', ($3::timestamptz) + interval '3 month', '3 month'::interval) as due_date
    ) returning *
  )
  select * from report_form_changes;
end;
  $generate_quarterly_reports$ language plpgsql volatile;

grant execute on function cif.generate_quarterly_reports to cif_internal, cif_external, cif_admin;
comment on function cif.generate_quarterly_reports
is $$
  Custom mutation to generate quarterly reports for a revision between contract_start_date and  measurement_period_end_date.
$$;

commit;
