-- Deploy cif:computed_columns/form_change_as_reporting_requirement to pg
-- requires: tables/form_change
-- requires: tables/reporting_requirement

begin;

create or replace function cif.form_change_as_reporting_requirement(cif.form_change)
returns cif.reporting_requirement
as $$
    select
      /**
        Given form_data_record_id can be null for some form_change records, it is not a reliable id value for the returned project_contact record.
        The returned id must not be null, so we use the form_change id being passed in as a parameter (multiplied by -1 to ensure we are not touching any existing records).
        This means the id value is not going to be the correct id for the returned project_contact record, which should be ok since we're only interested
        in the data in new_form_data.
      **/
      ($1.id * -1) as id,
      (new_form_data->>'projectId')::integer as project_id,
      new_form_data->>'reportType' as report_type,
      (new_form_data->>'reportDueDate')::timestamptz as report_due_date,
      (new_form_data->>'submittedDate')::timestamptz as submitted_date,
      new_form_data->>'comment' as comments,
      (new_form_data->>'reportingRequirementIndex')::integer as reporting_requirement_index,
      new_form_data->>'description' as description,
      null::int as created_by,
      now()::timestamptz created_at,
      null::int as updated_by,
      now()::timestamptz updated_at,
      null::int as archived_by,
      null::timestamptz as archived_at
    from cif.form_change fc where fc.id = $1.id and fc.form_data_table_name = 'reporting_requirement'

$$ language sql stable;

comment on function cif.form_change_as_reporting_requirement(cif.form_change) is 'Computed column returns data from the new_form_data column as if it were a reporting_requirement record to allow graph traversal via the foreign keys.';

commit;
