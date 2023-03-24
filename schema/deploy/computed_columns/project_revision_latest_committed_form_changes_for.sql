-- Deploy cif:computed_columns/project_revision_latest_committed_form_changes_for to pg

begin;

create or replace function cif.project_revision_latest_committed_form_changes_for(
 cif.project_revision,
  form_data_table_name text,
  json_matcher text default '{}',
  report_type text default null
)
returns setof cif.form_change
as
$computed_column$

  select *
    from cif.form_change
    where project_revision_id = (select id from cif.project_latest_committed_project_revision(
      (select row(project.*)::cif.project
      from cif.project
      where cif.project.id = $1.project_id
    )))
      and form_data_table_name=$2
      and new_form_data::jsonb @> $3::jsonb
      and case
        when $4 is null
        then new_form_data->>'reportType' is null
        when $4 = 'Milestone'
        then new_form_data->>'reportType' in ('General Milestone', 'Advanced Milestone', 'Performance Milestone', 'Reporting Milestone')
        else new_form_data->>'reportType' = $4 end
    order by updated_at desc;

$computed_column$ language sql stable;

grant execute on function cif.project_revision_latest_committed_form_changes_for to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_form_changes_for is 'Computed column to dynamically retrieve the form_change record relating to the project_revision from a given table';

commit;
