begin;
select plan(13);

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

-- setting a form change record
insert into cif.form(slug, json_schema, description) values ('test_schema', '{}'::jsonb, 'test description');

insert into cif.form_change(new_form_data, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name, change_status)
values (
  '{"textCol":"test text", "intCol":234, "boolCol": true, "requiredCol": "req", "defaultedCol": 1}',
  'create', 'mock_schema', 'mock_table', nextval(pg_get_serial_sequence('mock_schema.mock_table', 'id')), 'test_schema', 'pending'
);
/** END SETUP **/

-- make sure the function exists
select has_function('cif_private', 'handle_default_form_change_commit', 'Function handle_default_form_change_commit should exist');

-- function creates a table record
with record as (
  select row(form_change.*)::cif.form_change from cif.form_change limit 1
) select cif_private.handle_default_form_change_commit((select * from record));

select is(
  (select count(*) from mock_schema.mock_table),
  1::bigint,
  'A record should be created on a committed change'
);

-- doesnt insert if the data is missing required fields
insert into cif.form_change(new_form_data, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name, change_status)
values (
  '{"textCol":"test2 text"}',
  'create', 'mock_schema', 'mock_table', nextval(pg_get_serial_sequence('mock_schema.mock_table', 'id')), 'test_schema', 'pending'
);

select throws_ok(
  $$
    with record as (
  select row(form_change.*)::cif.form_change from cif.form_change where id = 2
) select cif_private.handle_default_form_change_commit((select * from record))
  $$,
  'null value in column "required_col" of relation "mock_table" violates not-null constraint'
);


-- inserts with default value if data is missing
insert into cif.form_change(new_form_data, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name, change_status)
values (
  '{"textCol":"test3", "requiredCol":"required"}',
  'create', 'mock_schema', 'mock_table', nextval(pg_get_serial_sequence('mock_schema.mock_table', 'id')), 'test_schema', 'pending'
);

with record as (
  select row(form_change.*)::cif.form_change from cif.form_change where id=3
) select cif_private.handle_default_form_change_commit((select * from record));

select results_eq(
  $$
    select defaulted_col from mock_schema.mock_table where text_col='test3'
  $$,
  $$
    values (99::integer)
  $$,
  'Default value should be inserted when not provided in the changes'
);

insert into cif.form_change(new_form_data, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name, change_status)
  values (
    '{}',
    'create', 'mock_schema', 'mock_table', 44, 'test_schema', 'pending'
  );

-- Does not throw with empty data & returns the form_data_record_id of the form_change parameter passed in
select is(
  (
    with record as (
      select row(form_change.*)::cif.form_change from cif.form_change where id=4
    ) select cif_private.handle_default_form_change_commit((select * from record))
  ),
  44::int,
  'Function does not throw an exception when trying to commit a change with an empty new_form_data & returns the form_data_record_id of the form_change parameter'
);

-- set client_min_messages to debug;
-- archive test
insert into cif.form_change(operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name, change_status)
  values (
    'archive', 'mock_schema', 'mock_table', 1, 'test_schema', 'pending'
  );
select lives_ok(
  $$
    with record as (
      select row(form_change.*)::cif.form_change from cif.form_change where id=5
    ) select cif_private.handle_default_form_change_commit((select * from record))
  $$,
  'a change record with the archive operation should not throw an exception'
);
reset client_min_messages;
select is(
  (select archived_at from mock_schema.mock_table where id=1),
  now(),
  'The record should be archived when the committed change operation is archive'
);

-- setting up pending change without specifying the record id
delete from cif.form_change;
truncate mock_schema.mock_table restart identity;
insert into cif.form_change(new_form_data, operation, form_data_schema_name, form_data_table_name, json_schema_name, change_status)
values (
  '{"textCol":"test text", "intCol":234, "boolCol": true, "requiredCol": "req", "defaultedCol": 1}',
  'create', 'mock_schema', 'mock_table', 'test_schema', 'pending'
);

select is(
  (
    with record as (
      select row(form_change.*)::cif.form_change from cif.form_change where id=6
    ) select cif_private.handle_default_form_change_commit((select * from record))
  ),
  1::int,
  'Function returns the id generated by the target table when no form_data_record_id is specified'
);

select is(
  (select count(*) from mock_schema.mock_table where text_col='test text'),
  1::bigint,
  'A record should be inserted when no form_data_record_id is specified'
);

-- setting up pending change without specifying the record id
delete from cif.form_change;
truncate mock_schema.mock_table restart identity;
insert into cif.form_change(new_form_data, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name, change_status)
values (
  '{"notATableCol": "shouldBeIgnored", "textCol":"test text", "intCol":234, "boolCol": true, "requiredCol": "req", "defaultedCol": 1}',
  'create', 'mock_schema', 'mock_table', nextval(pg_get_serial_sequence('mock_schema.mock_table', 'id')), 'test_schema', 'pending'
);

-- Function does not error when form_data object contains keys that are not columns in the target table (deprecated columns)
select lives_ok(
  $$
    with record as (
      select row(form_change.*)::cif.form_change from cif.form_change where id=7
    ) select cif_private.handle_default_form_change_commit((select * from record))
  $$,
  'Function ignores keys in the form_data that do not correspond to column in the target table (does not throw an error)'
);

select results_eq(
  $$
    select * from mock_schema.mock_table where id=1
  $$,
  $$
    values (1::integer, 'test text'::text, 234::integer, true::boolean, 'req'::text, 1::int, null::timestamptz)
  $$,
  'All proper values were inserted when form_data includes a key that does not correspond to a column in the target table'
);

-- function updates the table with null values when the form_data does not include a key that corresponds to a column in the target table
truncate mock_schema.mock_table restart identity;
insert into mock_schema.mock_table (text_col, int_col, bool_col, required_col, defaulted_col)
values ('test text', 234, true, 'req', 1);

-- this form change does not include the int_col
insert into cif.form_change(new_form_data, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name, change_status)
values (
  '{"textCol":"updated test text", "boolCol": false, "requiredCol": "updated req", "defaultedCol": 1}',
  'update', 'mock_schema', 'mock_table', 1, 'test_schema', 'pending'
);

with record as (
  select row(form_change.*)::cif.form_change from cif.form_change where id=8
) select cif_private.handle_default_form_change_commit((select * from record));

select results_eq(
  $$
    select * from mock_schema.mock_table where id=1
  $$,
  $$
    values (1::integer, 'updated test text'::text, null::integer, false::boolean, 'updated req'::text, 1::int, null::timestamptz)
  $$,
  'Function updates the table with null values when the form_data does not include a key that corresponds to a column in the target table'
);

-- function doesn't touch values that are not manipulated by the form change like the archived_at column
truncate mock_schema.mock_table restart identity;
insert into mock_schema.mock_table (text_col, int_col, bool_col, required_col, defaulted_col, archived_at)
values ('test text', 234, true, 'req', 1, '2023-06-01T12:00:01-07'::timestamptz);

insert into cif.form_change(new_form_data, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name, change_status)
values (
  '{"textCol":"updated test text", "requiredCol": "updated req"}',
  'update', 'mock_schema', 'mock_table', 1, 'test_schema', 'pending'
);

with record as (
  select row(form_change.*)::cif.form_change from cif.form_change where id=9
) select cif_private.handle_default_form_change_commit((select * from record));

select results_eq(
  $$
    select * from mock_schema.mock_table where id=1
  $$,
  $$
    values (1::integer, 'updated test text'::text, null::integer, null::boolean, 'updated req'::text, null::int, '2023-06-01T12:00:01-07'::timestamptz)
  $$,
  'Function does not touch values that are not manipulated by the form change like the archived_at column'
);

select finish();

rollback;
