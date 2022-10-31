begin;

select plan(6);

select has_function('cif', 'pending_new_form_change_for_table', 'function cif.pending_new_form_change_for_table exists');

insert into cif.cif_user (uuid, given_name, family_name, email_address)
values ('00000000-0000-0000-0000-000000000000', 'user1', 'Testuser', 'test@somemail.com'),
       ('11111111-1111-1111-1111-111111111111', 'user2', 'Testuser', 'test1@somemail.com');

set jwt.claims.sub to '00000000-0000-0000-0000-000000000000';

select mocks.set_mocked_time_in_transaction('2020-01-12');
insert into cif.form(slug, json_schema, description) values ('json_schema_name', '{}'::jsonb, 'test description');
insert into cif.form_change(new_form_data, operation, form_data_schema_name, form_data_table_name, json_schema_name)
values
('{"test": "first_record"}'::jsonb, 'create', 'cif', 'test_table', 'json_schema_name'),
('{"test": "pending_record"}'::jsonb, 'update', 'cif', 'update_test_table', 'json_schema_name'),
('{"test": "non-cif-schema"}'::jsonb, 'create', 'otherschema', 'non_cif_test_table', 'json_schema_name');

select mocks.set_mocked_time_in_transaction('2020-01-13');
insert into cif.form_change(new_form_data, operation, form_data_schema_name, form_data_table_name, json_schema_name)
values ('{"test": "most_recent_record"}'::jsonb, 'create', 'cif', 'test_table', 'json_schema_name');

select mocks.set_mocked_time_in_transaction('2020-01-11');
insert into cif.form_change(new_form_data, operation, form_data_schema_name, form_data_table_name, json_schema_name)
values ('{"test": "old_record"}'::jsonb, 'create', 'cif', 'test_table', 'json_schema_name');

-- reset time to now();
select mocks.set_mocked_time_in_transaction(null);

select is(
  (select new_form_data->>'test' from cif.pending_new_form_change_for_table('another_test_table')),
  NULL::text,
  'The function returns null if there is no pending form change for the given table'
);

select is(
  (select new_form_data->>'test' from cif.pending_new_form_change_for_table('non_cif_test_table')),
  NULL::text,
  'The function returns null if the schema is not cif'
);

select is(
  (select new_form_data->>'test' from cif.pending_new_form_change_for_table('update_test_table')),
  NULL::text,
  'The function returns null if the form_change is not a create operation'
);

select is(
  (select new_form_data->>'test' from cif.pending_new_form_change_for_table('test_table')),
  'most_recent_record',
  'The function returns the most recent form_change if there are multiple pending form changes for the given table and the given user'
);

set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';
select is(
  (select new_form_data->>'test' from cif.pending_new_form_change_for_table('test_table')),
  null::text,
  'The function returns null if there is no pending form change for the given user'
);


select finish();

rollback;
