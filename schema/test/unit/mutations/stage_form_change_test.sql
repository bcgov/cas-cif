

begin;

select plan(2);

insert into cif.form_change(
      id,
      new_form_data,
      operation,
      form_data_schema_name,
      form_data_table_name,
      form_data_record_id,
      project_revision_id,
      change_status,
      json_schema_name
    ) overriding system value values (
      12345,
      '{}'::jsonb,
      'create',
      'cif',
      'some_table',
      12345,
      null,
      'pending',
      'reporting_requirement'
    );

-- Returns the updated form_change record
select results_eq(
  $$
    select
      id,
      new_form_data,
      operation,
      form_data_schema_name,
      form_data_table_name,
      form_data_record_id,
      project_revision_id,
      change_status,
      json_schema_name
    from cif.stage_form_change(12345);
  $$,
  $$
    values (
       12345,
      '{}'::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'some_table'::varchar,
      12345,
      null::int,
      'staged'::varchar,
      'reporting_requirement'::varchar
    )
  $$,
  'The stage_form_change custom mutation returns the updated record'
);

-- Sets the change_status to 'staged'
select is(
  (select change_status from cif.form_change where id = 12345),
  'staged'::varchar,
  'The stage_form_change custom mutation sets the form_change status to staged'
);

select finish();

rollback;
