begin;
select plan(26);

select has_table('cif', 'form_change', 'table cif.form_change exists');


select has_column('cif', 'form_change', 'id', 'table cif.form_change has id column');
select has_column('cif', 'form_change', 'operation', 'table cif.form_change has operation column');
select has_column('cif', 'form_change', 'form_data_schema_name', 'table cif.form_change has form_data_schema_name column');
select has_column('cif', 'form_change', 'form_data_table_name', 'table cif.form_change has form_data_table_name column');
select has_column('cif', 'form_change', 'form_data_record_id', 'table cif.form_change has form_data_record_id column');
select has_column('cif', 'form_change', 'change_status', 'table cif.form_change has change_status column');
select has_column('cif', 'form_change', 'json_schema_name', 'table cif.form_change has json_schema_name column');
select has_column('cif', 'form_change', 'validation_errors', 'table cif.form_change has validation_errors column');
select has_column('cif', 'form_change', 'created_at', 'table cif.form_change has created_at column');
select has_column('cif', 'form_change', 'updated_at', 'table cif.form_change has updated_at column');
select has_column('cif', 'form_change', 'created_by', 'table cif.form_change has created_by column');
select has_column('cif', 'form_change', 'updated_by', 'table cif.form_change has updated_by column');

insert into cif.form(slug, json_schema, description) values ('test-schema', '{}'::jsonb, 'test description');

insert into cif.form_change
  (new_form_data, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name) values
  ('{}', 'create', 'cif', 'project', 1, 'project'),
  ('{}', 'create', 'cif', 'project', 2, 'project'),
  ('{}', 'create', 'cif', 'project', 3, 'project');


-- Trigger tests --

insert into cif.change_status (status, triggers_commit) values ('testcommitted', true), ('testpending', false);
insert into cif.form_change
  (new_form_data, operation, form_data_schema_name, form_data_table_name, form_data_record_id, change_status, json_schema_name) values
  ('{}', 'create', 'test-schema', 'test-table', 99, 'testpending', 'test-schema'),
  ('{}', 'create', 'test-schema', 'test-table', 100, 'testcommitted', 'test-schema');

select lives_ok(
  $$
    update cif.form_change set new_form_data = '{"a": 1 }' where form_data_record_id = 99
  $$,
  'allows update if the change status is pending'
);

select throws_ok(
  $$
    update cif.form_change set new_form_data = '{"a": 1 }' where form_data_record_id = 100
  $$,
  'Committed records cannot be modified',
  'prevents update if the change status is committed'
);

select throws_ok(
  $$
  delete from cif.form_change where form_data_record_id = 100
  $$,
  'Committed records cannot be modified',
  'prevents delete if the change status is committed'
);

-- Row level security tests --

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.form_change
  $$,
    'cif_admin can view all data in form_change table'
);

select lives_ok(
  $$
    insert into cif.form_change (new_form_data, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name)
      values ('{}', 'create', 'cif', 'project', 4, 'project');
  $$,
    'cif_admin can insert data in form_change table'
);

select lives_ok(
  $$
    update cif.form_change set new_form_data = '{"project_name": "created by admin"}' where form_data_record_id=4;
  $$,
    'cif_admin can change data in form_change table'
);



select results_eq(
  $$
    select count(id) from cif.form_change where new_form_data = '{"project_name": "created by admin"}'
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin'
);

select lives_ok(
  $$
    delete from cif.form_change where id=1;
  $$,
    'cif_admin can delete data in form_change table'
);

-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.form_change
  $$,
  ARRAY['6'::bigint],
    'cif_internal can view all data from form_change'
);

select lives_ok(
  $$
    insert into cif.form_change (new_form_data, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name)
      values ('{}', 'create', 'cif', 'project', 5, 'project');
  $$,
    'cif_internal can insert data in form_change table'
);

select lives_ok(
  $$
    update cif.form_change set new_form_data = '{"project_name": "created by internal"}' where form_data_record_id=5;
  $$,
    'cif_internal can update data in the form_change table'
);

select results_eq(
  $$
    select count(*) from cif.form_change where new_form_data = '{"project_name": "created by internal"}';
  $$,
  ARRAY['1'::bigint],
    'Data was changed by cif_internal'
);

select lives_ok(
  $$
    delete from cif.form_change where form_data_record_id=1;
  $$,
    'cif_internal can delete data in form_change table'
);

select finish();
rollback;
