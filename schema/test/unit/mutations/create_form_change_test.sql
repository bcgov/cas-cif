begin;

select plan(7);

insert into cif.operator (legal_name) values ('test operator');
insert into cif.project_revision(id, change_status)
overriding system value
values (1, 'pending');

select results_eq(
  $$
  select
    operation,
    json_schema_name,
    form_data_schema_name,
    form_data_table_name,
    change_reason,
    new_form_data,
    form_data_record_id,
    project_revision_id,
    change_status,
    validation_errors
  from cif.create_form_change(
    operation => 'INSERT',
    json_schema_name => 'project',
    form_data_schema_name => 'cif',
    form_data_table_name => 'project',
    change_reason => 'Created project',
    new_form_data => format('{
        "projectName": "name",
        "summary": "lorem ipsum",
        "fundingStreamRfpId": 1,
        "projectStatusId": 1,
        "rfpNumber": "1235",
        "operatorId": %s
      }',
      (select id from cif.operator order by id desc limit 1)
    )::jsonb,
    form_data_record_id => 1234,
    project_revision_id => 1,
    change_status => 'pending',
    validation_errors => '[]'::jsonb
  )
  $$,
  $$values (
    'INSERT'::varchar(1000),
    'project'::varchar(1000),
    'cif'::varchar(1000),
    'project'::varchar(1000),
    'Created project'::varchar(10000),
    format('{
        "projectName": "name",
        "summary": "lorem ipsum",
        "fundingStreamRfpId": 1,
        "projectStatusId": 1,
        "rfpNumber": "1235",
        "operatorId": %s
      }',
      (select id from cif.operator order by id desc limit 1)
    )::jsonb,
    1234,
    1,
    'pending'::varchar(1000),
    '[]'::jsonb
  )$$,
  'cif.create_form_change returns the created form_change record'
);

select results_eq(
  $$
  select
    operation,
    json_schema_name,
    form_data_schema_name,
    form_data_table_name,
    change_reason,
    new_form_data,
    form_data_record_id,
    project_revision_id,
    change_status,
    validation_errors
  from cif.form_change
  $$,
  $$values (
    'INSERT'::varchar(1000),
    'project'::varchar(1000),
    'cif'::varchar(1000),
    'project'::varchar(1000),
    'Created project'::varchar(10000),
    format('{
        "projectName": "name",
        "summary": "lorem ipsum",
        "fundingStreamRfpId": 1,
        "projectStatusId": 1,
        "rfpNumber": "1235",
        "operatorId": %s
      }',
      (select id from cif.operator order by id desc limit 1)
    )::jsonb,
    1234,
    1,
    'pending'::varchar(1000),
    '[]'::jsonb
  )$$,
  'cif.create_form_change inserts a form_change record'
);

update cif.form_change set change_status = 'committed';

select results_eq(
  $$
  select
    new_form_data
  from cif.create_form_change(
    operation => 'UPDATE',
    json_schema_name => 'project',
    form_data_schema_name => 'cif',
    form_data_table_name => 'project',
    change_reason => 'Created project',
    form_data_record_id => 1234
  )
  $$,
  $$values (
    format('{
        "projectName": "name",
        "summary": "lorem ipsum",
        "fundingStreamRfpId": 1,
        "projectStatusId": 1,
        "rfpNumber": "1235",
        "operatorId": %s
      }',
      (select id from cif.operator order by id desc limit 1)
    )::jsonb
  )$$,
  'cif.create_form_change uses the latest committed form_data record for the same table and record id'
);

select cif.create_form_change(
  operation => 'INSERT',
  json_schema_name => 'project',
  form_data_schema_name => 'cif',
  form_data_table_name => 'project',
  change_reason => 'Created project',
  form_data_record_id => 4567
);

select results_eq(
  $$
  select
    new_form_data
  from cif.create_form_change(
    operation => 'UPDATE',
    json_schema_name => 'project',
    form_data_schema_name => 'cif',
    form_data_table_name => 'project',
    change_reason => 'Created project',
    form_data_record_id => 4567
  )
  $$,
  $$
  values (null::jsonb)
  $$,
  'cif.create_form_change does not copy new_form_data if the form_data_record_id does not match an existing comitted form_change record'
);

select results_eq(
  $$
  select
    new_form_data
  from cif.create_form_change(
    operation => 'UPDATE',
    json_schema_name => 'project',
    form_data_schema_name => 'cif',
    form_data_table_name => 'other_table',
    change_reason => 'Created project',
    form_data_record_id => 1234
  )
  $$,
  $$
  values (null::jsonb)
  $$,
  'cif.create_form_change does not copy new_form_data if the form_data_table_name does not match an existing comitted form_change record'
);

-- create an update for our comitted project, but don't commit it yet
select cif.create_form_change(
    operation => 'UPDATE',
    json_schema_name => 'project',
    form_data_schema_name => 'cif',
    form_data_table_name => 'project',
    change_reason => 'Update project',
    new_form_data => format('{
        "projectName": "updated name",
        "summary": "lorem ipsum",
        "fundingStreamRfpId": 1,
        "projectStatusId": 1,
        "rfpNumber": "1235",
        "operatorId": %s
      }',
      (select id from cif.operator order by id desc limit 1)
    )::jsonb,
    form_data_record_id => 1234,
    change_status => 'pending'
);


select results_eq(
  $$
  select
    new_form_data->>'projectName'
  from cif.create_form_change(
    operation => 'UPDATE',
    json_schema_name => 'project',
    form_data_schema_name => 'cif',
    form_data_table_name => 'project',
    change_reason => 'Created project',
    form_data_record_id => 1234
  )
  $$,
  $$values (
    'name'
  )$$,
  'cif.create_form_change only copies the new_form_data from comitted form_change records'
);

update cif.form_change set change_status = 'committed' where new_form_data->>'projectName' = 'updated name';

select results_eq(
  $$
  select
    new_form_data->>'projectName'
  from cif.create_form_change(
    operation => 'UPDATE',
    json_schema_name => 'project',
    form_data_schema_name => 'cif',
    form_data_table_name => 'project',
    change_reason => 'Created project',
    form_data_record_id => 1234
  )
  $$,
  $$values (
    'updated name'
  )$$,
  'cif.create_form_change copies the new_form_data from the most recent comitted form_change record'
);


select finish();

rollback;
