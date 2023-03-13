-- Deploy cif:mutations/add_additional_funding_source_to_revision to pg

begin;

create or replace function cif.add_additional_funding_source_to_revision(revision_id int, source_index int)
returns cif.form_change
as $add_additional_funding_source_form_change$
  insert into cif.form_change(
    new_form_data,
    operation,
    form_data_schema_name,
    form_data_table_name,
    project_revision_id,
    change_status,
    json_schema_name
  ) values (
      (format(
      '{ "projectId": %s, "sourceIndex": %s }',
      (select form_data_record_id from cif.form_change where form_data_schema_name='cif' and form_data_table_name='project' and project_revision_id=$1),
      $2
      )::jsonb),
    'create',
    'cif',
    'additional_funding_source',
    $1,
    'pending',
    'additional_funding_source'
  ) returning *;
$add_additional_funding_source_form_change$ language sql volatile;

commit;
