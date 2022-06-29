-- Note:
-- This test tests that the project_revision trigger propagates to the linked form_change rows.
-- This doesn't test that the form_change rows are creating database records when they are in turn committed.

begin;

select plan(7);

insert into cif.change_status (status, triggers_commit, active)
values
  ('test_pending', false, true),
  ('test_committed', true, true);

insert into cif.cif_user (uuid, given_name, family_name, email_address)
values ('00000000-0000-0000-0000-000000000000', 'test', 'Testuser', 'test@somemail.com');

insert into cif.operator(legal_name) values ('test operator');
insert into cif.funding_stream(name, description) values ('stream', 'stream description');
insert into cif.contact(given_name, family_name, email) values ('John', 'Test', 'foo@abc.com');

select cif.create_project();

update cif.form_change set new_form_data=format('{
      "projectName": "name",
      "summary": "lorem ipsum",
      "fundingStreamRfpId": 1,
      "projectStatusId": 1,
      "proposalReference": "1235",
      "operatorId": %s
    }',
    (select id from cif.operator order by id desc limit 1)
  )::jsonb
  where project_revision_id=(select id from cif.project_revision order by id desc limit 1)
    and form_data_table_name='project';

-- make sure the function exists
select has_function('cif_private', 'commit_project_revision', 'Function commit_project_revision should exist');

-- propagates the status change to all form changes no matter what
-- make sure project_revision and form changes are created with change status 'pending'
select results_eq(
  $$
    select change_status from cif.form_change where project_revision_id=(select id from cif.project_revision order by id desc limit 1);
  $$,
  $$
    values ('pending'::varchar);
  $$,
  'Two form changes should be initialized with the pending status'
);

-- make sure project_revision has a null project id
select results_eq(
  $$
    select project_id from cif.project_revision where id=(select id from cif.project_revision order by id desc limit 1);
  $$,
  $$
    values (null::integer);
  $$,
  'project id should be null before the project is committed'
);

-- set the project_revision status to 'test_pending'
update cif.project_revision set change_status='test_pending' where id=(select id from cif.project_revision order by id desc limit 1);

-- make sure project_revision and form changes are created with change status 'test_pending'
select results_eq(
  $$
    select change_status from cif.form_change where project_revision_id = (select id from cif.project_revision order by id desc limit 1);
  $$,
  $$
    values ('test_pending'::varchar);
  $$,
  'the form_change row should be have the test_pending status'
);
-- make sure project_revision has a null project id
select is(
  (select project_id from cif.project_revision where id=1),
  null,
  'project_id should be null before the project is committed'
);

-- set the project_revision status to 'test_committed'
update cif.project_revision set change_status='committed' where id=(select id from cif.project_revision order by id desc limit 1);

-- make sure project_revision and form changes have change status 'test_committed'
select results_eq(
  $$
    select change_status from cif.form_change where project_revision_id=(select id from cif.project_revision order by id desc limit 1);
  $$,
  $$
    values ('committed'::varchar);
  $$,
  'the form_change rows should have the committed status'
);

-- make sure project_revision has a project id equal to the one that was in the form
select is(
  (select project_id from cif.project_revision),
  (select form_data_record_id from cif.form_change where project_revision_id=(select id from cif.project_revision order by id desc limit 1) and form_data_table_name='project'),
  'project_id should be set to the project_id that was in the form'
);

select finish();

rollback;
