-- Deploy cif:mutations/generate_annual_reports to pg

begin;

create or replace function cif.generate_annual_reports(revision_id int, start_date timestamptz, end_date timestamptz)
  returns setof cif.form_change as
  $generate_annual_reports$
declare
  start_date_year int := extract(year from $2);
  report_interval_start_date timestamptz;
begin
  if $2 >= $3 then
      raise exception 'start_date must be before end_date';
  end if;

  -- if start date is before or equal to jan 30th, we will start the first annual report on the next year otherwise we will start on the next 2 year
  if $2 <= make_date(start_date_year, 01, 30) then
    report_interval_start_date := make_date(start_date_year + 1, 01, 30);
  else
    report_interval_start_date := make_date(start_date_year + 2, 01, 30);
  end if;

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
        'reportType', 'Annual',
        'reportDueDate', due_date::timestamptz,
        'reportingRequirementIndex', row_number() over()
      ),
      'create',
      'cif',
      'reporting_requirement',
      'reporting_requirement',
      $1
      -- setting the `report_interval_start_date` to the end of the day to make sure we have the correct date on the front end (the front end is using the end of the day to display the date)
      from generate_series(date_trunc('day', report_interval_start_date::timestamptz) + interval '1 day' - interval '1 second', ($3::timestamptz) + interval '1 year', '1 year'::interval) as due_date
    ) returning *
  )
  select * from report_form_changes;
end;
  $generate_annual_reports$ language plpgsql volatile;

grant execute on function cif.generate_annual_reports to cif_internal, cif_external, cif_admin;
comment on function cif.generate_annual_reports
is $$
  Custom mutation to generate annual reports for a revision between emissions intensity report_due_date and project_assets_life_end_date.
$$;

commit;
