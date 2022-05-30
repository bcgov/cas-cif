-- Deploy cif:mutations/create_project to pg
-- requires: tables/project

begin;

create or replace function cif.create_project()
returns cif.project_revision
as $function$
declare
  revision_row cif.project_revision;
  next_project_id integer;
begin

  insert into cif.project_revision (
      project_id,
      change_status,
      is_first_revision
    ) values (
      -- project_id is null until the project is created
      null,
      'pending',
      true
    ) returning * into revision_row;

  next_project_id :=  nextval(pg_get_serial_sequence('cif.project', 'id'));

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
    '{}',
    'create',
    'cif',
    'project',
    next_project_id,
    revision_row.id,
    'pending',
    'project'
  ), (
    format('{ "projectId": %s, "contactIndex": 1 }', next_project_id)::jsonb,
    'create',
    'cif',
    'project_contact',
    null,
    revision_row.id,
    'pending',
    'project_contact'
  );
  return revision_row;
end;
$function$ language plpgsql strict volatile;

grant execute on function cif.create_project to cif_internal, cif_external, cif_admin;
grant usage, select on sequence cif.project_id_seq to cif_internal, cif_external, cif_admin;

commit;
