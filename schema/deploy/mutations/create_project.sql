-- Deploy cif:mutations/create_project to pg
-- requires: tables/project

begin;

create or replace function cif.create_project()
returns cif.project_revision
as $function$
declare
  revision_row cif.project_revision;
begin

  insert into cif.project_revision (
      project_id,
      change_status
    ) values (
      -- project_id is null until the project is created
      null,
      'pending'
    ) returning * into revision_row;

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
    '{}',
    'INSERT',
    'cif',
    'project',
    nextval(pg_get_serial_sequence('cif.project', 'id')),
    revision_row.id,
    'pending',
    'Creating new project: project record'
  ), (
    format('{ "projectId": %s }', revision_row.id)::jsonb,
    'INSERT',
    'cif',
    'project_manager',
    nextval(pg_get_serial_sequence('cif.project_manager', 'id')),
    revision_row.id,
    'pending',
    'Creating new project: project_manager record'
  );

  return revision_row;
end;
$function$ language plpgsql strict volatile;

grant execute on function cif.create_project to cif_internal, cif_external, cif_admin;
grant usage, select on sequence cif.project_id_seq to cif_internal, cif_external, cif_admin;
grant usage, select on sequence cif.project_manager_id_seq to cif_internal, cif_external, cif_admin;

commit;
