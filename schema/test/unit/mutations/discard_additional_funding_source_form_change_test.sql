
begin;

select plan(7);

/** SETUP **/

truncate cif.operator restart identity cascade;
truncate cif.project restart identity cascade;
insert into cif.operator (legal_name) values ('test operator');

select cif.create_project();

insert into cif.form(slug, json_schema, description) values ('some_other_schema', '{}'::jsonb, 'test description');

-- adding additional funding sources
insert into cif.form_change(
id,
new_form_data,
operation,
form_data_schema_name,
form_data_table_name,
change_status,
json_schema_name,
project_revision_id
) overriding system value
values
(
2,
json_build_object(
    'projectId', 1,
    'sourceIndex', 1,
    'source', 'cheese import taxes-1',
    'amount', 1000,
    'status', 'Awaiting Approval'
  ),
'create', 'cif', 'additional_funding_source', 'pending', 'additional_funding_source',1),
(
3,
json_build_object(
    'projectId', 1,
    'sourceIndex', 2,
    'source', 'cheese export taxes-2',
    'amount', 2000,
    'status', 'Approved'
  ),
'create', 'cif', 'additional_funding_source', 'pending', 'additional_funding_source',1),
(
4,
json_build_object(
    'projectId', 1,
    'sourceIndex', 3,
    'source', 'cheese import taxes-3',
    'amount', 3000,
    'status', 'Approved'
  ),
'create', 'cif', 'additional_funding_source', 'pending', 'additional_funding_source',1),
(
5,
json_build_object(
    'projectId', 1,
    'sourceIndex', 4,
    'source', 'cheese export taxes-4',
    'amount', 4000,
    'status', 'Denied'
  ),
'update', 'cif', 'additional_funding_source', 'pending', 'additional_funding_source',1),
(
6,
  '{"testField": "test value"}',
  'create',
  'cif',
  'some_other_table',
  'pending',
  'some_other_schema',
  1
);

/** END SETUP **/

select set_eq(
  $$
    select id from cif.discard_additional_funding_source_form_change(2::int)
  $$,
  $$
    values (1::int)
  $$,
  'discard_additional_funding_source_form_change returns the deleted rows'
);

select is(
  (
    select count(*) from cif.form_change
    where project_revision_id = 1
    and form_data_table_name = 'additional_funding_source'
    and operation = 'create'
  ),
  2::bigint,
  'There should be two create form_change records'
);

select is(
  (select count(*) from cif.form_change
  where project_revision_id = 1
  and form_data_table_name = 'additional_funding_source'
  and operation = 'create'
  and (new_form_data->>'source')::varchar = 'cheese export taxes-1'
  ),
  0::bigint,
  'Only the record with the correct source is deleted'
);

select is(
  (select count(*) from cif.form_change
  where project_revision_id = 1
  and
    form_data_table_name = 'some_other_table'
  ),
  1::bigint,
  'Only the record with the correct source is deleted and some_other_table_name exists'
);

select is(
  (select count(*) from cif.form_change
  where project_revision_id = 1
  and
    operation = 'archive'
  ),
  0::bigint,
  'There should be no archived form_change record'
);

-- to discard a form change with update operation
select set_eq(
  $$
    select id from cif.discard_additional_funding_source_form_change(5::integer)
  $$,
  $$
    values (1::int)
  $$,
  'discard_additional_funding_source_form_change returns the deleted rows'
);

select is(
  (select count(*) from cif.form_change
  where project_revision_id = 1
  and
    operation = 'archive'
  ),
  1::bigint,
  'There should be 1 archived form_change record'
);

select finish();

rollback;
