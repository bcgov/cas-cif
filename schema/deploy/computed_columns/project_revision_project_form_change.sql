-- Deploy cif:computed_columns/project_revision_project_form_change to pg
-- requires: tables/project_revision

begin;

create or replace function cif.project_revision_project_form_change(cif.project_revision)
returns cif.form_change
as
$computed_column$

  with project_form_change as (
    select *
      from cif.form_change
      where form_data_schema_name='cif'
        and form_data_table_name='project'
  ),
  project_form_change_history as (
    select *
      from project_form_change
      where project_revision_id = $1.id
    union
    (
      select distinct on (form_data_record_id) *
        from project_form_change
        where change_status = 'committed'
          and form_data_record_id is not null
          and form_data_record_id = $1.project_id
          and updated_at < $1.updated_at
        order by form_data_record_id, updated_at desc, id desc
    )
  )
  select * from project_form_change_history limit 1;

$computed_column$ language sql stable;

grant execute on function cif.project_revision_project_form_change to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_project_form_change is
'Computed column for graphql to retrieve the change related to the project record, within a project revision.
If the change does not exist for the project revision, i.e. if the project form was not modified in this revision,
it returns the change matching the project record for this project revision.';

commit;
