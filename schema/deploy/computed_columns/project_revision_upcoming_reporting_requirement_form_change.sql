-- Deploy cif:computed_columns/project_revision_upcoming_reporting_requirement_form_change to pg

begin;


create or replace function cif.project_revision_upcoming_reporting_requirement_form_change(project_revision cif.project_revision, report_type text[])
returns cif.form_change
as
$computed_column$

-- Update the project_revision_upcoming_reporting_requirement_form_change computed column to accept an array of values: this can be done by using the string_to_array function of postgres, and check for new_form_data->>'reportType'=any(...array...)

  select * from cif.form_change
  where project_revision_id = $1.id
    and form_data_schema_name='cif'
    and form_data_table_name='reporting_requirement'
    and ($2 is null or new_form_data->>'reportType'=any(...report_type...))
    and new_form_data->>'submittedDate' is null
  order by (new_form_data->>'reportDueDate')::timestamptz asc
  fetch first row only

$computed_column$ language sql stable;

grant execute on function cif.project_revision_upcoming_reporting_requirement_form_change to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_upcoming_reporting_requirement_form_change is
  'Computed column to return the form_change for the earliest due reporting requirement that hasn''t been submitted, optionally constrained by the report type';


commit;
