begin;

select plan(6);

/** SETUP **/
truncate cif.form_change restart identity;

create schema mock_schema;

create table mock_schema.mock_table (
  id integer primary key generated always as identity,
  text_col text,
  int_col integer,
  bool_col boolean,
  required_col text not null,
  defaulted_col int default 99,
  archived_at timestamptz
);

insert into cif.form(slug, json_schema, description) values ('test_schema', '{}'::jsonb, 'test description');

-- setting a form change record
insert into cif.form_change(
  new_form_data, operation, form_data_schema_name, form_data_table_name,
  form_data_record_id, json_schema_name, change_status, validation_errors
)
values (
  '{"textCol":"test text", "intCol":234, "bool_col": true, "requiredCol": "req", "defaultedCol": 1}',
  'create', 'mock_schema', 'mock_table', nextval(pg_get_serial_sequence('mock_schema.mock_table', 'id')), 'test_schema', 'pending', '[]'
),
(
  '{"textCol":"test text", "intCol":234, "bool_col": true, "requiredCol": "req", "defaultedCol": 1}',
  'create', 'mock_schema', 'mock_table', nextval(pg_get_serial_sequence('mock_schema.mock_table', 'id')), 'test_schema', 'pending', '["some_error"]'
)
;

-- make sure the function exists
select has_function('cif_private', 'commit_form_change_internal', ARRAY['cif.form_change', 'int'], 'Function commit_form_change_internal should exist');

select results_eq(
  $$
    with record as (
      select row(form_change.*)::cif.form_change from cif.form_change where id=1
    ) select id, change_status from cif_private.commit_form_change_internal((select * from record));
  $$,
  $$
    values (1::int, 'committed'::varchar);
  $$,
  'commit_form_change returns the committed record'
);

select is(
  (select count(*) from mock_schema.mock_table),
  1::bigint,
  'A record should be created on a committed change'
);

select is(
  (select change_status from cif.form_change where id=1),
  'committed',
  'The form_change status should be committed'
);

select throws_like(
  $$
  with record as (
    select row(form_change.*)::cif.form_change from cif.form_change where id=2
  ) select cif_private.commit_form_change_internal((select * from record));
  $$,
  'Cannot commit change with validation errors: %',
  'Throws an exception if there are validation errors'
);

select is(
  (select change_status from cif.form_change where id=2),
  'pending',
  'The form_change status should be committed'
);




select finish();

rollback;
