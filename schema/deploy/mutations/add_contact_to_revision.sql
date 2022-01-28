-- Deploy cif:mutations/add_contact_to_revision to pg

begin;

create or replace function cif.add_contact_to_revision(revision_id int, contact_index int)
returns cif.form_change
as $add_contact_form_change$
  insert into cif.form_change(
    new_form_data,
    operation,
    form_data_schema_name,
    form_data_table_name,
    form_data_record_id,
    project_revision_id,
    change_status,
    change_reason
  ) values (
    format(
      '{ "projectId": %s, "contactIndex": %s }',
      (select form_data_record_id from cif.form_change where form_data_schema_name='cif' and form_data_table_name='project' and project_revision_id=$1),
      $2
    )::jsonb,
    'INSERT',
    'cif',
    'project_contact',
    nextval(pg_get_serial_sequence('cif.project_contact', 'id')),
    $1,
    'pending',
    'Creating new project: secondary project_contact record'
  ) returning *;
$add_contact_form_change$ language sql volatile;

commit;
