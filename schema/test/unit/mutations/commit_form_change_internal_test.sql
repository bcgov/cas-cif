begin;

select plan(19);

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


-- Test the concurrent revision functinality

truncate table cif.project, cif.operator, cif.contact, cif.attachment restart identity cascade;
insert into cif.operator(legal_name) values ('test operator');
insert into cif.contact(given_name, family_name, email) values ('John', 'Test', 'foo@abc.com');
insert into cif.attachment (description, file_name, file_type, file_size)
  values ('description1', 'file_name1', 'file_type1', 100);

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

select cif.add_contact_to_revision(3, 1, 1);
select cif.add_project_attachment_to_revision(3,1);

select cif.commit_project_revision(3);

-- Both committing and pending project revisions have made changes to the project form.
select is (
  (select new_form_data->>'projectName' from cif.form_change where project_revision_id = 2 and form_data_table_name = 'project'),
  'Correct',
  'When both the committing and pending form changes have changed the same field, the value from the pending should persist'
);

select is (
  (select previous_form_change_id from cif.form_change where project_revision_id = 2 and form_data_table_name = 'project'),
  3::int,
  'When committing, the pending form change gets the committing form change as its previous form change'
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

select is (
  (select new_form_data from cif.form_change where project_revision_id = 2 and form_data_table_name = 'project_contact'),
  '{"contactId": 1, "projectId": 1, "contactIndex": 1}'::jsonb,
  'When the committing form change is creating a project contact, the contact also gets created in the pending revision'
);

select is (
  (select previous_form_change_id from cif.form_change where project_revision_id = 2 and form_data_table_name = 'project_contact'),
  4::int,
  'When committing has an operation of create, the pending form change gets the committing form change as its previous form change'
);

select is (
  (select form_data_record_id from cif.form_change where project_revision_id = 2 and form_data_table_name = 'project_attachment'),
  1::int,
  'When committing has an operation of create, the form_data_record_id propogates to the pending form change for attachments'
);

select is (
  (select form_data_record_id from cif.form_change where project_revision_id = 2 and form_data_table_name = 'project_contact'),
  1::int,
  'When committing has an operation of create, the form_data_record_id propogates to the pending form change for contacts'
);

select is (
  (select count(*) from cif.form_change where project_revision_id = 2 and form_data_table_name = 'project_attachment'),
  1::bigint,
  'When the committing form change is creating a project attachment, the attachment also gets created in the pending revision'
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

-- Test when committing has made changes to the form but the pending has not
select cif.create_project_revision(1, 'Amendment'); -- id = 4
select cif.create_project_revision(1, 'General Revision'); -- id = 5
update cif.form_change set new_form_data='{
      "projectName": "Correct only newer",
      "summary": "Correct",
      "fundingStreamRfpId": 1,
      "projectStatusId": 1,
      "proposalReference": "1235",
      "operatorId": 1
    }'::jsonb
  where project_revision_id=5
    and form_data_table_name='project';

select cif.discard_project_attachment_form_change((select id from cif.form_change where project_revision_id = 5 and form_data_table_name = 'project_attachment'));

select cif.commit_project_revision(5);

select is (
  (select new_form_data->>'projectName' from cif.form_change where id = 8),
  'Correct only newer',
  'The pending form change should have the value from the committing form change'
);

select is (
  (select count(*) from cif.form_change where project_revision_id = 4 and form_data_table_name = 'project_attachment'),
  0::bigint,
  'When the committing form change is discarding a project attachment, the pending fc is deleted.'
);

select cif.commit_project_revision(4);
select is (
  (select project_name from cif.project where id = 1),
  'Correct only newer',
  'The project table should have the updated proejct name, even after the pending amendment is committed'
);

select finish();

rollback;
