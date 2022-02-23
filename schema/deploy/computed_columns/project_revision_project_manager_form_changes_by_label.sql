-- Deploy cif:computed_columns/project_revision_project_manager_form_changes_by_label to pg
-- requires: tables/form_change
-- requires: tables/project_manager

begin;

create or replace function cif.project_revision_project_manager_form_changes_by_label(cif.project_revision)
returns setof cif.manager_form_changes_by_label_composite_return
as
$computed_column$

  with project_form_change_history as (
    select fc.*
      from cif.form_change fc
      join cif.project_manager_label pml on cast(new_form_data->>'projectManagerLabelId' as integer) = pml.id
        and (fc.updated_at, fc.id) = (select max(updated_at), max(id) from cif.form_change where cast(new_form_data->>'projectManagerLabelId' as integer) = pml.id)
      where project_revision_id = $1.id
        and form_data_schema_name='cif'
        and form_data_table_name='project_manager'
    union
    select fc.*
      from cif.form_change fc
      join cif.project_manager pm on
        fc.form_data_record_id = pm.id
        and pm.project_id = $1.project_id
        and (fc.updated_at, fc.id) = (select max(updated_at), max(id) from cif.form_change where form_data_record_id = pm.id)
  )
  select label, row(project_form_change_history.*) as form_change
    from project_form_change_history
    right join cif.project_manager_label pml
      on cast(new_form_data->>'projectManagerLabelId' as integer) = pml.id;

$computed_column$ language sql stable;

grant execute on function cif.project_revision_project_manager_form_changes_by_label to cif_internal, cif_external, cif_admin;

comment on function cif.project_revision_project_manager_form_changes_by_label is 'Computed column returns a composite value for each record in project_manager_label and the last related form_change if it exists';

commit;
