
begin;

select plan(5);

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
  'project_attachment',
  'project_attachment',
  null,
  1,
  '[]'
),(
  '{"testField": "test value"}',
  'update',
  'pending',
  'cif',
  'project_attachment',
  'project_attachment',
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

-- if an attachment has never been committed, hard delete
select results_eq(
  $$
    select
      id,
      operation,
      project_revision_id
    from cif.discard_project_attachment_form_change(2)
  $$,
  $$
    values (2, 'create'::cif.form_change_operation, 1)
  $$,
  'discard_project_attachment_form_change returns the deleted row'
);

select is(
  (
    select count(*) from cif.form_change
    where project_revision_id = 1
    and form_data_table_name = 'project_attachment'
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
  'Only the record with the correct project_attachment is deleted, project and some_other_table still exist'
);

select is(
  (select count(*) from cif.form_change
  where project_revision_id = 1
  and
    form_data_table_name = 'some_other_table'
  ),
  1::bigint,
  'Only the record with the correct project_attachment is deleted and some_other_table_name exists'
);

-- if an attachment has been committed already, soft delete
select cif.discard_project_attachment_form_change(3);

select is(
  (select count(*) from cif.form_change
  where project_revision_id = 1
  and
    operation = 'archive'
  and form_data_table_name = 'project_attachment'
  ),
  1::bigint,
  'There should be 1 archived form_change record for the project_attachment table'
);

rollback;
