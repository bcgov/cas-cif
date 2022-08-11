
begin;

select plan(3);

-- Test Setup
truncate cif.operator restart identity cascade;
truncate cif.project restart identity cascade;
select cif.create_project();
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
  'funding_parameter',
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
  (select count(*) from cif.form_change
  where project_revision_id = 1
  and (
    (form_data_table_name = 'funding_parameter')
    and project_revision_id=1
  )),
  0::bigint,
  'There should be no form_change records for the deleted funding_parameter'
);

select is(
  (select count(*) from cif.form_change
  where project_revision_id = 1
  and (
    operation = 'archive'
  )),
  1::bigint,
  'Only the record with the correct funding_parameter and its dependents are deleted'
);

rollback;
