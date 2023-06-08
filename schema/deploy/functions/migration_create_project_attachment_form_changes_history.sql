-- Deploy cif:functions/migration_create_project_attachment_form_changes_history to pg
-- requires: tables/form_change
-- requires: tables/project_attachment

begin;

create or replace function cif_private.migration_create_project_attachment_form_changes_history()
returns void as
$migration$

declare
  form_change_record record;
  project_revision_record record;

begin
  -- loop through all pending form changes of project_attachment
  for form_change_record in
    select * from cif.form_change
    where form_data_table_name = 'project_attachment'
    and change_status = 'pending'
  loop
    -- if project_revision id is equal to the form_change project_revision_id and its change_status is committed -> commit the form_change
    perform cif_private.commit_form_change_internal(row(form_change.*)::cif.form_change)
      from cif.form_change
      where id = form_change_record.id
      and (select change_status from cif.project_revision where id = form_change_record.project_revision_id) = 'committed';
    -- select all project_revisions for the project_id of the form_change that have a higher id than the project_revision_id of the form_change
    for project_revision_record in select * from cif.project_revision
      where project_id = (form_change_record.new_form_data->>'projectId')::integer
      and id > form_change_record.project_revision_id
    loop
      -- if project revision doesn't have the exact same form_change:
      -- copy the form_change to project_revision and set the change_status to project_revision change_status and update the created_at and updated_at to be the same as the project_revision
      -- this is done to make sure that this function can be run multiple times without creating duplicate form_changes
      if not exists (
        select * from cif.form_change
        where project_revision_id = project_revision_record.id
        and form_data_record_id = form_change_record.form_data_record_id
      ) then
        insert into cif.form_change (
          operation, form_data_schema_name,
          json_schema_name, project_revision_id,
          form_data_table_name, form_data_record_id,
          new_form_data, change_status,
          created_by, created_at,
          updated_by, updated_at
        ) values (
          'create',
          'cif',
          'project_attachment',
          project_revision_record.id,
          'project_attachment',
          form_change_record.form_data_record_id,
          form_change_record.new_form_data,
          -- form_change change_status can be only pending or committed but project_revision change_status can be pending, committed or staged
          case
            when project_revision_record.change_status = 'committed' then 'committed'
            else 'pending'
          end,
          form_change_record.created_by,
          project_revision_record.created_at,
          form_change_record.updated_by,
          project_revision_record.updated_at
        );
      end if;
    end loop;
  end loop;
end;

$migration$ language plpgsql volatile;

comment on function cif_private.migration_create_project_attachment_form_changes_history
  is $$
    Create project_attachment form changes history
  $$;

commit;
