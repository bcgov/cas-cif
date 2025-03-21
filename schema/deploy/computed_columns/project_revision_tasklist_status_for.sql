-- Deploy cif:computed_columns/project_revision_tasklist_status_for to pg
-- requires: util_functions/get_form_status

begin;

create or replace function cif.project_revision_tasklist_status_for(cif.project_revision, form_data_table_name text, json_matcher text default '{}')
returns text
as
$computed_column$

with form_status as (
  select * from cif.get_form_status($1.id, $2, $3::jsonb)
)
select
    case
      when ($2 is null)
        then null
      when (select exists (select * from form_status where get_form_status = 'Attention Required'))
          then 'Attention Required'
      when (select exists (select * from form_status where get_form_status = 'In Progress'))
        then 'In Progress'
      -- If we have only another status that is not 'Not Started' and that status is 'Filled' then we are complete
      when (select count(distinct get_form_status) from form_status where get_form_status != 'Not Started') = 1
        and (select (select distinct get_form_status from form_status where get_form_status != 'Not Started')) = 'Filled'
          then 'Filled'
      else
        case
          when ($1.is_first_revision)
            then 'Not Started'
          else 'No Changes'
        end
    end;

$computed_column$ language sql stable;

grant execute on function cif.project_revision_tasklist_status_for to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_tasklist_status_for is 'Computed column to return a tasklist status for any tasklist form with an optional json matcher on the form selection';

commit;
