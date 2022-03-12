

begin;

select plan(4);

create table cif.test_table(
  id integer primary key generated always as identity,
  test_field text,
  archived_at timestamptz
);

insert into cif.form_change(new_form_data, operation, form_data_schema_name, form_data_table_name, change_reason, json_schema_name)
values (
  '{"testField": "test value"}',
  'create',
  'cif',
  'test_table',
  'form_change_is_unique_value test',
  'schema'
);


select is(
  (
    select cif.form_change_is_unique_value((select row(form_change.*)::cif.form_change from cif.form_change where change_reason='form_change_is_unique_value test'), 'testField')
  ),
  true,
  'Returns true if the table is empty'
);

insert into cif.test_table(test_field)
values ('another value');

select is(
  (
    select cif.form_change_is_unique_value((select row(form_change.*)::cif.form_change from cif.form_change where change_reason='form_change_is_unique_value test'), 'testField')
  ),
  true,
  'Returns true if the table does not contain the value'
);

insert into cif.test_table(test_field)
values ('test value');

select is(
  (
    select cif.form_change_is_unique_value((select row(form_change.*)::cif.form_change from cif.form_change where change_reason='form_change_is_unique_value test'), 'testField')
  ),
  false,
  'Returns false if the value exists in the table'
);

update cif.test_table set archived_at=now() where test_field='test value';

select is(
  (
    select cif.form_change_is_unique_value((select row(form_change.*)::cif.form_change from cif.form_change where change_reason='form_change_is_unique_value test'), 'testField')
  ),
  true,
  'Returns true if the value exists in the table on a record that is archived'
);

select finish();

rollback;
