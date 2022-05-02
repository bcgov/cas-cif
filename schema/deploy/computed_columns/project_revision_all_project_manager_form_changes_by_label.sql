-- Deploy cif:computed_columns/project_revision_all_project_manager_form_changes_by_label to pg
-- requires: tables/form_change
-- requires: tables/project_manager

begin;

create or replace function cif.project_revision_all_project_manager_form_changes_by_label(cif.project_revision)
returns setof cif.manager_form_changes_by_label_composite_return
as
$computed_column$

  with latest_changes as (
    select * from cif.form_change
    where project_revision_id = $1.id
    order by new_form_data->'projectManagerLabelId', updated_at desc, id desc
  ) select row(pml.*), row(latest_changes.*) as form_change
    from latest_changes
    right join cif.project_manager_label pml
      on (new_form_data->'projectManagerLabelId')::int = pml.id;

$computed_column$ language sql stable;

grant execute on function cif.project_revision_project_manager_form_changes_by_label to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_project_manager_form_changes_by_label is 'Computed column returns a composite value for each record in project_manager_label and the last related form_change (including archived records) if it exists';

commit;
