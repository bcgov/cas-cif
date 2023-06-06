-- Deploy cif:mutations/add_project_attachment_to_revision to pg
-- requires: tables/form_change

begin;

drop function cif.add_project_attachment_to_revision(project_id int, attachment_id int, revision_id int);
create or replace function cif.add_project_attachment_to_revision(revision_id int,attachment_id int)
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
      (select form_data_record_id from cif.form_change where form_data_schema_name='cif' and form_data_table_name='project' and project_revision_id=$1),
      $2
    )::jsonb,
    'create',
    'cif',
    'project_attachment',
    (select nextval(pg_get_serial_sequence('cif.project_attachment', 'id'))),
    $1,
    'pending',
    'project_attachment'
  ) returning *;
$function$ language sql volatile;

grant execute on function cif.add_project_attachment_to_revision to cif_internal, cif_external, cif_admin;
grant usage, select on sequence cif.project_attachment_id_seq to cif_internal, cif_external, cif_admin;

comment on function cif.add_project_attachment_to_revision is
$comment$
  Creates a new project_attachment form_change record for the given revision_id and attachment_id.
$comment$;

commit;
