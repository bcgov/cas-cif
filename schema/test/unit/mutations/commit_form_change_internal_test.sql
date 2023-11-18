begin;

select plan(10);

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
select has_function('cif_private', 'commit_form_change_internal', ARRAY['cif.form_change'], 'Function commit_form_change_internal should exist');

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


-- Test the concurrent revision functinality

truncate table cif.project, cif.operator restart identity cascade;
insert into cif.operator(legal_name) values ('test operator');
insert into cif.contact(given_name, family_name, email) values ('John', 'Test', 'foo@abc.com');

select cif.create_project(1); -- id = 1
update cif.form_change set new_form_data='{
      "projectName": "name",
      "summary": "original (incorrect at point of test)",
      "fundingStreamRfpId": 1,
      "projectStatusId": 1,
      "proposalReference": "1235",
      "operatorId": 1
    }'::jsonb
  where project_revision_id=1
    and form_data_table_name='project';
select cif.commit_project_revision(1);


select cif.create_project_revision(1, 'Amendment'); -- id = 2
update cif.form_change set new_form_data='{
      "projectName": "Correct",
      "summary": "original (incorrect at point of test)",
      "fundingStreamRfpId": 1,
      "projectStatusId": 1,
      "proposalReference": "1235",
      "operatorId": 1
    }'::jsonb
  where project_revision_id=2
    and form_data_table_name='project';

select cif.create_project_revision(1, 'General Revision'); -- id = 3
update cif.form_change set new_form_data='{
      "projectName": "Incorrect",
      "summary": "Correct",
      "fundingStreamRfpId": 1,
      "projectStatusId": 1,
      "proposalReference": "1235",
      "operatorId": 1
    }'::jsonb
  where project_revision_id=3
    and form_data_table_name='project';

select cif.commit_project_revision(3);

select is (
  (select new_form_data->>'projectName' from cif.form_change where project_revision_id = 2 and form_data_table_name = 'project'),
  'Correct',
  'When both the committing and pending form changes have changed the same field, the value from the pending should persist'
);

select is (
  (select project_name from cif.project where id = 1),
  'Incorrect',
  'The project receives the value from the committing form change'
);

select is (
  (select new_form_data->>'summary' from cif.form_change where project_revision_id = 2 and form_data_table_name = 'project'),
  'Correct',
  'When the commiting form change has updated a field that the pending has not, it updates the pending form change'
);

-- Commit the ammednment
select cif.commit_project_revision(2);

select results_eq (
  $$
    (select project_name, summary, funding_stream_rfp_id, project_status_id, proposal_reference, operator_id from cif.project where id = 1)
  $$,
  $$
    values('Correct'::varchar, 'Correct'::varchar, 1::int, 1::int, '1235'::varchar, 1::int)
  $$,
  'After committing the pending form change, the project table has all of the correct values'
);


select finish();

rollback;
