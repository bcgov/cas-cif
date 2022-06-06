-- Deploy cif:computed_columns/form_change_reporting_requirement_status to pg
-- requires: tables/form_change

begin;

create or replace function cif.form_change_reporting_requirement_status(form_change cif.form_change)
returns setof text
as
$function$

  select
    case
      when (fc.new_form_data ->> 'reportDueDate')::timestamptz < now()
        and fc.new_form_data ->> 'submittedDate' is null
        then 'on_track'
      when (fc.new_form_data ->> 'reportDueDate')::timestamptz >= now()
        and fc.new_form_data ->> 'submittedDate' is null
        then 'late'
      when fc.new_form_data ->> 'reportDueDate' is not null
        and fc.new_form_data ->> 'submittedDate' is not null
        then 'completed'
      else null
    end
  from cif.form_change fc
  where fc.id = $1.id
  and fc.form_data_table_name = $1.form_data_table_name
  and fc.new_form_data ->> 'reportType' = $1.new_form_data ->> 'reportType';

$function$ language sql stable;

grant execute on function cif.form_change_reporting_requirement_status to cif_internal, cif_external, cif_admin;

comment on function cif.form_change_reporting_requirement_status is 'A computed column to return the status for a reporting requirement form_change record based on the report_due_date and submitted_date';

commit;
