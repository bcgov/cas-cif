-- Deploy cif:mutations/create_project to pg
-- requires: tables/project

begin;

create or replace function cif.create_project(project cif.project)
returns cif.project
as $function$
begin

  insert into cif.form_change(
    new_form_data,
    operation,
    form_data_schema_name,
    form_data_table_name,
    form_data_record_id,
    change_status,
    change_reason
  ) values (
    to_jsonb($1) - 'id',
    'INSERT',
    'cif',
    'project',
    nextval(pg_get_serial_sequence('cif.project', 'id')),
    'pending',
    'create new project'
  );
  return null;
end;
$function$ language plpgsql strict volatile;

grant execute on function cif.create_project to cif_internal, cif_external, cif_admin;

commit;


/**
FOR TESTING:

  with record as (select jsonb_populate_record(null::cif.project, '{"cif_identifier": 4444, "description": "new proj"}'))
    select cif.create_project((select * from record)::cif.project);

**/
