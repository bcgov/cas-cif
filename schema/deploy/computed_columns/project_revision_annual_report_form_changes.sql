-- Deploy cif:computed_column/project_revision_annual_report_form_changes.sql to pg

begin;


create or replace function cif.project_revision_project_annual_report_form_changes(project_revision cif.project_revision)
returns setof cif.form_change
as
$computed_column$

  select *
    from cif.form_change
    where project_revision_id = project_revision.id
      and form_data_schema_name='cif'
      and form_data_table_name='reporting_requirement'
      and new_form_data->>'reportType'='Annual';

$computed_column$ language sql stable;

grant execute on function cif.project_revision_project_annual_report_form_changes to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_project_annual_report_form_changes is 'Computed column for graphql to retrieve the changes related to the Annual reporting requirement records, within a project revision';

commit;
