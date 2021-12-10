-- Deploy cif:computed_columns/project_revision_project_manager_form_change to pg
-- requires: tables/project_revision

begin;

create or replace function cif.project_revision_project_manager_form_change(project_revision cif.project_revision)
returns cif.form_change
as
$computed_column$

  select *
    from cif.form_change
    where project_revision_id = project_revision.id
      and form_data_schema_name='cif'
      and form_data_table_name='project_manager';

$computed_column$ language sql stable;

grant execute on function cif.project_revision_project_form_change to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_project_form_change is 'Computed column for graphql to retrieve the change related to the project manager association, within a project revision';

commit;
