-- Deploy cif:computed_columns/project_revision_project_milestone_report_form_changes to pg
-- requires: tables/reporting_requirement
-- requires: tables/project_revision

begin;

create or replace function cif.project_revision_project_milestone_report_form_changes(cif.project_revision)
returns setof cif.form_change
as
$computed_column$

  select *
    from cif.form_change
    where project_revision_id = $1.id
      and form_data_schema_name='cif'
      and form_data_table_name='reporting_requirement'
      and new_form_data->>'reportType' in ('General Milestone', 'Advanced Milestone', 'Performance Milestone', 'Reporting Milestone');

$computed_column$ language sql stable;

grant execute on function cif.project_revision_project_milestone_report_form_changes to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_project_milestone_report_form_changes is 'Computed column for graphql to retrieve the changes related to the milestone reporting requirement records, within a project revision';

commit;
