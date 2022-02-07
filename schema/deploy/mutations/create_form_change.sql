-- Deploy cif:mutations/create_form_change to pg

begin;

create function cif.create_form_change(
  operation cif.form_change_operation,
  json_schema_name varchar(1000),
  form_data_schema_name varchar(1000),
  form_data_table_name varchar(1000),
  change_reason varchar(10000),
  new_form_data jsonb default null,
  form_data_record_id integer default null,
  project_revision_id integer default null,
  change_status varchar(1000) default 'pending',
  validation_errors jsonb default '[]'
) returns cif.form_change as $create_form_change$
  insert into cif.form_change(
    new_form_data,
    operation,
    form_data_schema_name,
    form_data_table_name,
    form_data_record_id,
    project_revision_id,
    change_status,
    change_reason,
    json_schema_name,
    validation_errors
  ) values (
    coalesce(new_form_data, (
      select new_form_data
      from cif.form_change
      where form_data_record_id = create_form_change.form_data_record_id
      and form_data_schema_name = create_form_change.form_data_schema_name
      and form_data_table_name = create_form_change.form_data_table_name
      and change_status = 'committed'
      order by updated_at desc, id desc
      limit 1
    )),
    operation,
    form_data_schema_name,
    form_data_table_name,
    form_data_record_id,
    project_revision_id,
    change_status,
    change_reason,
    json_schema_name,
    validation_errors
  ) returning *;
$create_form_change$ language sql;

comment on function cif.create_form_change is
$comment$
Creates a new form_change record.
If new_form_data is not provided, the latest committed form_data record for the same table and record id will be used.$comment$;

commit;
