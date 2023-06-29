-- Deploy cif:functions/migration_create_form_changes_for_existing_project_attachments to pg
-- requires: tables/form_change
-- requires: tables/project_attachment

begin;

create or replace function cif_private.migration_create_form_changes_for_existing_project_attachments()
returns void as
$migration$

declare
  record cif.project_attachment;
  revision_id int;

begin
  for record in
    select * from cif.project_attachment
  loop
    if not exists (
      select * from cif.form_change
      where (new_form_data->>'projectId')::int = record.project_id
      and (new_form_data->>'attachmentId')::int = record.attachment_id
      )then
      revision_id = (select id from cif.project_latest_committed_project_revision((select row(project.*)::cif.project from cif.project where id=record.project_id)));
      insert into cif.form_change (
        operation,
        form_data_schema_name,
        json_schema_name,
        project_revision_id,
        form_data_table_name,
        form_data_record_id,
        new_form_data,
        change_status,
        created_by,created_at,
        updated_by,updated_at
      ) values (
        'create',
        'cif',
        'project_attachment',
        (select id from cif.project_latest_committed_project_revision((select row(project.*)::cif.project from cif.project where id=record.project_id))),
        'project_attachment',
        record.id,
        jsonb_build_object(
          'projectId', record.project_id,
          'attachmentId', record.attachment_id
        ),
        'committed',
        record.created_by,
        record.created_at,
        record.updated_by,
        record.updated_at
      );
    end if;
  end loop;

  -- taking care of the project attachment form changes with null new_form_data
 update cif.form_change fc1
 set new_form_data = (
    select new_form_data from cif.form_change
    where form_data_record_id = fc1.form_data_record_id
    and form_data_table_name='project_attachment' order by id desc limit 1
  ),
  previous_form_change_id = (
    select id from cif.form_change
    where form_data_record_id = fc1.form_data_record_id
    and form_data_table_name='project_attachment' order by id desc limit 1
  )
  where new_form_data is null and form_data_table_name = 'project_attachment';

end;
$migration$ language plpgsql volatile;

comment on function cif_private.migration_create_form_changes_for_existing_project_attachments
  is $$
    Create project_attachment form_changes for existing project_attachments.
  $$;

commit;
