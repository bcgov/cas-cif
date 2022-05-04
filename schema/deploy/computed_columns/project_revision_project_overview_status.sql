-- Deploy cif:computed_columns/project_revision_project_overview_status to pg
-- requires: tables/overview_status

begin;

create or replace function cif.project_revision_project_overview_status(cif.project_revision)
returns text
as
$computed_column$

  select
    case
      when fc.change_status = 'pending'
        and (select cif.form_change_is_pristine((select row(form_change.*)::cif.form_change from cif.form_change where id=fc.id)) is distinct from true)
        then 'Incomplete'
      when fc.change_status= 'staged'
        and json_array_length(fc.validation_errors::json) = 0
        then 'Complete'
      when fc.change_status= 'staged'
        and json_array_length(fc.validation_errors::json) > 0
        then 'Attention Required'
      else 'Not Started'
    end overview_status
  from cif.form_change fc
  where fc.project_revision_id = $1.id
  and fc.form_data_schema_name = 'cif'
  and fc.form_data_table_name = 'project';

$computed_column$ language sql stable;

grant execute on function cif.project_revision_project_overview_status to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_project_overview_status is 'Computed column for graphql to retrieve the change related to the project record, within a project revision';

commit;
