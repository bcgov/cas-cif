

begin;

select plan(5);

create table cif.test_table(
  id integer primary key generated always as identity,
  test_field text,
  archived_at timestamptz
);

insert into cif.form(slug, json_schema, description) values ('schema', '{}'::jsonb, 'test description');

insert into cif.form_change(new_form_data, operation, form_data_schema_name, form_data_table_name, json_schema_name)
values (
  '{"testField": "test value"}',
  'create',
  'cif',
  'test_table',
  'schema'
);


select is(
  (
    select cif.form_change_is_unique_value((select row(form_change.*)::cif.form_change from cif.form_change where new_form_data='{"testField": "test value"}'), 'testField')
  ),
  true,
  'Returns true if the table is empty'
);

insert into cif.test_table(test_field)
values ('another value');

select is(
  (
    select cif.form_change_is_unique_value((select row(form_change.*)::cif.form_change from cif.form_change where new_form_data='{"testField": "test value"}'), 'testField')
  ),
  true,
  'Returns true if the table does not contain the value'
);

insert into cif.test_table(test_field)
values ('test value');

select is(
  (
    select cif.form_change_is_unique_value((select row(form_change.*)::cif.form_change from cif.form_change where new_form_data='{"testField": "test value"}'), 'testField')
  ),
  false,
  'Returns false if the value exists in the table'
);

update cif.test_table set archived_at=now() where test_field='test value';

select is(
  (
    select cif.form_change_is_unique_value((select row(form_change.*)::cif.form_change from cif.form_change where new_form_data='{"testField": "test value"}'), 'testField')
  ),
  true,
  'Returns true if the value exists in the table on a record that is archived'
);


insert into cif.test_table(test_field)
values ('an existing value');

insert into cif.form_change(new_form_data, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name)
values (
  '{"testField": "an existing value"}',
  'update',
  'cif',
  'test_table',
  (select id from cif.test_table where test_field='an existing value'),
  'schema'
);

select is(
  (
    select cif.form_change_is_unique_value((select row(form_change.*)::cif.form_change from cif.form_change where new_form_data='{"testField": "an existing value"}'), 'testField')
  ),
  true,
  'Returns true if the value exists in the table on the record the form_change is trying to modify'
);

select finish();

rollback;
