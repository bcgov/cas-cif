-- Deploy cif:computed_columns/form_change_reporting_requirement_status to pg
-- requires: tables/form_change

begin;

create or replace function cif.form_change_reporting_requirement_status(form_change cif.form_change)
returns text
as
$function$

  select
    case
      when ($1.new_form_data ->> 'reportDueDate')::timestamptz > now()
        and $1.new_form_data ->> 'submittedDate' is null
        then 'On track'
      when ($1.new_form_data ->> 'reportDueDate')::timestamptz <= now()
        and $1.new_form_data ->> 'submittedDate' is null
        then 'Late'
      when $1.new_form_data ->> 'reportDueDate' is not null
        and $1.new_form_data ->> 'submittedDate' is not null
        then 'Completed'
      else null
    end

$function$ language sql stable;

grant execute on function cif.form_change_reporting_requirement_status to cif_internal, cif_external, cif_admin;

comment on function cif.form_change_reporting_requirement_status is 'A computed column to return the status for a reporting requirement form_change record based on the report_due_date and submitted_date';

commit;
