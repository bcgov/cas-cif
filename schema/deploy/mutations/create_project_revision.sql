-- Deploy cif:mutations/create_project_revision to pg

begin;

create function cif.create_project_revision(project_id integer)
returns cif.project_revision
as $function$
declare
  revision_row cif.project_revision;
  form_change_record record;
begin
  insert into cif.project_revision(project_id, change_status)
  values ($1, 'pending') returning * into revision_row;

  perform cif.create_form_change(
    operation => 'update',
    form_data_schema_name => 'cif',
    form_data_table_name => 'project',
    form_data_record_id => $1,
    project_revision_id => revision_row.id,
    json_schema_name => 'project'
  );


  for form_change_record in
  (
    select
      id,
      'update'::cif.form_change_operation as operation,
      'project_manager' as form_data_table_name,
      'project_manager' as json_schema_name
    from cif.project_manager
    where project_manager.project_id = $1
    and archived_at is null
  union
    select
      id,
      'update'::cif.form_change_operation as operation,
      'project_contact' as form_data_table_name,
      'project_contact' as json_schema_name
    from cif.project_contact
    where project_contact.project_id = $1
    and archived_at is null
  )
  loop
    perform cif.create_form_change(
      operation => form_change_record.operation,
      form_data_schema_name => 'cif',
      form_data_table_name => form_change_record.form_data_table_name,
      form_data_record_id => form_change_record.id,
      project_revision_id => revision_row.id,
      json_schema_name => form_change_record.json_schema_name
    );
  end loop;

  return revision_row;
end;
$function$ language plpgsql strict;


commit;
