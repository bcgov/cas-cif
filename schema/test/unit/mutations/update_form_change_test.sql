
begin;

select plan(6);

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
      'staged',
      'reporting_requirement'
    );

-- It returns the updated record
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
    from cif.update_form_change(
      12345, (select row( null, null, null, null, null, null, null, null, null, null, null, null, null, null, null)::cif.form_change)
    );
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
      'pending'::varchar,
      'reporting_requirement'::varchar
    )
  $$,
  'The update_form_change custom mutation returns the updated record'
);

-- It sets the change_status to pending every time

select is(
  (select change_status from cif.form_change where id = 12345),
  'pending'::varchar,
  'The update_form_change custom mutation sets the form_change status to pending'
);

-- It only updates the new_form_data, validation_errors and operation fields

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
      json_schema_name,
      validation_errors
    from cif.update_form_change(
      12345, (select row( 123, '{"test":2}'::jsonb, 'archive', 'test-schema', 'test-table', 1111, 2222, 'committed', 'some-schema-name', '[{"error":"yes"}]'::jsonb, null, null, null, null, null)::cif.form_change)
    );
  $$,
  $$
    values (
       12345,
      '{"test":2}'::jsonb,
      'archive'::cif.form_change_operation,
      'cif'::varchar,
      'some_table'::varchar,
      12345,
      null::int,
      'pending'::varchar,
      'reporting_requirement'::varchar,
      '[{"error":"yes"}]'::jsonb
    )
  $$,
  'The update_form_change only updates the new_form_data, validation_errors and operation fields'
);

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
      54321,
      '{}'::jsonb,
      'archive',
      'cif',
      'some_table',
      54321,
      null,
      'staged',
      'reporting_requirement'
    );
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
    from cif.update_form_change(
      54321, (select row( 54321, '{"test":2}'::jsonb, null, 'test-schema', 'test-table', 1111, 2222, 'committed', 'some-schema-name', '[]'::jsonb, null, null, null, null, null)::cif.form_change)
    );
  $$,
  $$
    values (
       54321,
      '{"test":2}'::jsonb,
      'update'::cif.form_change_operation,
      'cif'::varchar,
      'some_table'::varchar,
      54321,
      null::int,
      'pending'::varchar,
      'reporting_requirement'::varchar
    )
  $$,
  'The update_form_change custom mutation correctly handles undefined operation when currently archived. Should be set to update'
);

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
      444,
      '{}'::jsonb,
      'create',
      'cif',
      'some_table',
      444,
      null,
      'staged',
      'reporting_requirement'
    );
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
    from cif.update_form_change(
      444, (select row( 444, '{"test":2}'::jsonb, null, 'test-schema', 'test-table', 1111, 2222, 'committed', 'some-schema-name', '[]'::jsonb, null, null, null, null, null)::cif.form_change)
    );
  $$,
  $$
    values (
       444,
      '{"test":2}'::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'some_table'::varchar,
      444,
      null::int,
      'pending'::varchar,
      'reporting_requirement'::varchar
    )
  $$,
  'The update_form_change custom mutation correctly handles create operation'
);

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
      777,
      '{"project_contact": 123}'::jsonb,
      'create',
      'cif',
      'project_contact',
      444,
      null,
      'staged',
      'project_contact'
    );
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
    from cif.update_form_change(
      777, (select row( 444, '{"test":2}'::jsonb, null, 'project_contact', 'project_contact', 1111, 2222, 'committed', 'project_contact', '[]'::jsonb, null, null, null, null, null)::cif.form_change)
    );
  $$,
  $$
    values (
       777,
      '{"test":2}'::jsonb,
      'archive'::cif.form_change_operation,
      'cif'::varchar,
      'project_contact'::varchar,
      444,
      null::int,
      'pending'::varchar,
      'project_contact'::varchar
    )
  $$,
  'The update_form_change custom mutation correctly handles the removal of a project contact, marking it archived'
);
select finish();

rollback;
