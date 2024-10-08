-- Deploy cif:mutations/add_project_attachment_to_revision to pg

begin;

create or replace function cif.add_project_attachment_to_revision(project_id int, attachment_id int, revision_id int)
returns cif.form_change
as $function$
  insert into cif.form_change(
  new_form_data,
  operation,
  form_data_schema_name,
  form_data_table_name,
  form_data_record_id,
  project_revision_id,
  change_status,
  json_schema_name
) values (
    format(
      '{"projectId": %s, "attachmentId": %s }',
      $1,
      $2
    )::jsonb,
    'create',
    'cif',
    'project_attachment',
    (select nextval(pg_get_serial_sequence('cif.project_attachment', 'id'))),
    $3,
    'pending',
    'project_attachment'
  ) returning *;
$function$ language sql volatile;

grant execute on function cif.add_project_attachment_to_revision to cif_internal, cif_external, cif_admin;
grant usage, select on sequence cif.project_attachment_id_seq to cif_internal, cif_external, cif_admin;

comment on function cif.add_project_attachment_to_revision is
$comment$
  Creates a new project_attachment form_change record for the given project_id, attachment_id, and revision_id.
$comment$;

commit;
