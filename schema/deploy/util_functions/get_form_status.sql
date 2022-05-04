-- Deploy cif:util_functions/get_form_status to pg
-- requires: tables/form_change

begin;

create or replace function cif.get_form_status(int, text)
returns setof text
as
$function$

  select
    case
      when fc.change_status = 'pending'
        and (select cif.form_change_is_pristine((select row(form_change.*)::cif.form_change from cif.form_change where id=fc.id)) is distinct from true)
        then 'Incomplete'
      when fc.change_status= 'staged'
        and json_array_length(fc.validation_errors::json) = 0
        and (select cif.form_change_is_pristine((select row(form_change.*)::cif.form_change from cif.form_change where id=fc.id)) is distinct from true)
        then 'Complete'
      when fc.change_status= 'staged'
        and json_array_length(fc.validation_errors::json) > 0
        then 'Attention Required'
      else 'Not Started'
    end
  from cif.form_change fc
  where fc.project_revision_id = $1
  and fc.form_data_table_name = $2

$function$ language sql stable;

grant execute on function cif.get_form_status to cif_internal, cif_external, cif_admin;

comment on function cif.get_form_status is 'A utility function to return a set of statuses for form_change records relating to a single revision';

commit;
