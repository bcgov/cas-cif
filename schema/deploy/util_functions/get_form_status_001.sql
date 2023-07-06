-- Deploy cif:util_functions/get_form_status_001 to pg

begin;

create or replace function cif.get_form_status(project_revision_id int, form_data_table_name text, json_matcher jsonb default '{}')
returns setof text
as
$function$

  select
    case
        -- return not started for empty project form
      when $2 = 'project'
        and (fc.change_status = 'pending')
        and (select cif.form_change_is_pristine((select row(form_change.*)::cif.form_change from cif.form_change where id=fc.id)) is distinct from true)
        and (
          ((select new_form_data from cif.form_change where id=fc.id) is null)
          or ((select new_form_data from cif.form_change where id=fc.id) = jsonb_build_object()))
        then 'Not Started'
      when fc.change_status = 'pending'
        and (select cif.form_change_is_pristine((select row(form_change.*)::cif.form_change from cif.form_change where id=fc.id)) is distinct from true)
        then 'In Progress'
      when fc.change_status = 'pending'
        and (fc.new_form_data::jsonb ? 'fundingStreamRfpId'
        and (select count(*) from jsonb_object_keys(fc.new_form_data::jsonb)) =1
        )
        then 'In Progress'
      when fc.change_status= 'staged'
        and fc.operation != 'archive'
        and (fc.new_form_data::jsonb ? 'fundingStreamRfpId'
        and (select count(*) from jsonb_object_keys(fc.new_form_data::jsonb)) =1
        )
        then 'Attention Required'
      when fc.change_status= 'staged'
        and json_array_length(fc.validation_errors::json) = 0
        and (select cif.form_change_is_pristine((select row(form_change.*)::cif.form_change from cif.form_change where id=fc.id)) is distinct from true)
        then 'Filled'
      when fc.change_status= 'staged'
        and fc.operation != 'archive'
        and json_array_length(fc.validation_errors::json) > 0
        then 'Attention Required'
      else 'Not Started'
    end
  from cif.form_change fc
  where fc.project_revision_id = $1
  and fc.form_data_table_name = $2
  and coalesce(fc.new_form_data, '{}'::jsonb) @> json_matcher

$function$ language sql stable;

grant execute on function cif.get_form_status to cif_internal, cif_external, cif_admin;

comment on function cif.get_form_status is 'A utility function to return a set of statuses for form_change records relating to a single revision';

commit;
