
begin;

select plan(6);

-- Test Setup
truncate cif.operator restart identity cascade;
truncate cif.project restart identity cascade;
select cif.create_project(1);

insert into cif.form(slug, json_schema, description) values ('some_other_schema', '{}'::jsonb, 'test description');

insert into cif.form_change(
  new_form_data,
  operation,
  change_status,
  form_data_schema_name,
  form_data_table_name,
  json_schema_name,
  previous_form_change_id,
  project_revision_id,
  validation_errors)
values (
  '{"testField": "test value"}',
  'create',
  'pending',
  'cif',
  'funding_parameter',
  'funding_parameter_EP',
  null,
  1,
  '[]'
),(
  '{"testField": "test value"}',
  'update',
  'pending',
  'cif',
  'funding_parameter',
  'funding_parameter_EP',
  null,
  1,
  '[]'
),(
  '{"testField": "test value"}',
  'create',
  'pending',
  'cif',
  'some_other_table',
  'some_other_schema',
  null,
  1,
  '[]'
),(
  '{"testField": "test value"}',
  'update',
  'pending',
  'cif',
  'additional_funding_source',
  'funding_parameter_EP',
  null,
  1,
  '[]'
);

select set_eq(
  $$
    select project_revision_id from cif.discard_funding_parameter_form_change(1)
  $$,
  $$
    values (1::int)
  $$,
  'discard_funding_parameter_form_change returns the deleted rows'
);

select is(
  (
    select count(*) from cif.form_change
    where project_revision_id = 1
    and form_data_table_name = 'funding_parameter'
    and operation = 'create'
  ),
  0::bigint,
  'There should be no create form_change records'
);

select is(
  (select count(*) from cif.form_change
  where project_revision_id = 1
  and
    operation = 'create'
  ),
  2::bigint,
  'Only the record with the correct funding_parameter is deleted, project and some_other_table still exist'
);

select is(
  (select count(*) from cif.form_change
  where project_revision_id = 1
  and
    form_data_table_name = 'some_other_table'
  ),
  1::bigint,
  'Only the record with the correct funding_parameter is deleted and some_other_table_name exists'
);

select is(
  (select count(*) from cif.form_change
  where project_revision_id = 1
  and
    operation = 'archive'
  and form_data_table_name = 'funding_parameter'
  ),
  1::bigint,
  'There should be 1 archived form_change record for the funding_parameter table'
);

select is(
  (select count(*) from cif.form_change
  where project_revision_id = 1
  and operation = 'archive'
  and form_data_table_name = 'additional_funding_source'
  ),
  1::bigint,
  'The additional funding source associated with this funding agreement should be archived'
)

rollback;
