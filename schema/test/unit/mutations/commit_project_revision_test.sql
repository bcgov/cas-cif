begin;

select plan(13);

/** BEGIN SETUP **/
truncate table
  cif.form_change,
  cif.project_revision,
  cif.project,
  cif.project_contact,
  cif.contact,
  cif.project_manager,
  cif.operator,
  cif.attachment,
  cif.emission_intensity_report,
  cif.milestone_report,
  cif.reporting_requirement,
  cif.payment,
  cif.funding_parameter,
  cif.additional_funding_source,
  cif.project_revision_amendment_type,
  cif.project_attachment
restart identity;

insert into cif.operator(legal_name) values ('test operator');
insert into cif.contact(given_name, family_name, email) values ('John', 'Test', 'foo@abc.com');

select cif.create_project(1);

update cif.form_change set new_form_data='{
      "projectName": "name",
      "summary": "lorem ipsum",
      "fundingStreamRfpId": 1,
      "projectStatusId": 1,
      "proposalReference": "1235",
      "operatorId": 1
    }'::jsonb
  where project_revision_id=1
    and form_data_table_name='project';

insert into cif.form_change(
  new_form_data,
  operation,
  form_data_schema_name,
  form_data_table_name,
  json_schema_name,
  project_revision_id
)
  values
(
  json_build_object(
    'projectId', 1,
    'contactId', 1,
    'contactIndex', 1
  ),
  'create', 'cif', 'project_contact', 'project_contact', 1
);

/** END SETUP **/

-- make sure the function exists
select has_function('cif', 'commit_project_revision', ARRAY['integer'], 'Function commit_project_revision should exist');

-- propagates the status change to all form changes no matter what
-- make sure project_revision and form changes are created with change status 'pending'
select results_eq(
  $$
    select change_status from cif.form_change where project_revision_id=(select id from cif.project_revision order by id desc limit 1);
  $$,
  $$
    values ('pending'::varchar), ('pending'::varchar);
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

-- call the mutation that sets values
select results_eq(
  $$
    select id, change_status, project_id, revision_status from cif.commit_project_revision(1);
  $$,
  $$
    values (1::int, 'committed'::varchar, 1::int,'Applied'::varchar);
  $$,
  'commit_project_revision returns the committed record'
);

-- make sure project_revision has a project id equal to the one that was in the form
select is(
  (select project_id from cif.project_revision),
  (select form_data_record_id from cif.form_change where project_revision_id=(select id from cif.project_revision order by id desc limit 1) and form_data_table_name='project'),
  'revision project_id should be set to the project_id that was in the form'
);

-- make sure project_contact has a project id equal to the one that was in the form
select is(
  (select project_id from cif.project_contact),
  (select form_data_record_id from cif.form_change where project_revision_id=(select id from cif.project_revision order by id desc limit 1) and form_data_table_name='project'),
  'project_contact project_id should be set to the project_id that was in the form'
);

/** Create a second set of records to check our deferred constraints **/
select cif.create_project(1);

update cif.form_change set new_form_data='{
      "projectName": "name",
      "summary": "lorem ipsum",
      "fundingStreamRfpId": 1,
      "projectStatusId": 1,
      "proposalReference": "1235",
      "operatorId": 1
    }'::jsonb
  where project_revision_id=2
    and form_data_table_name='project';

insert into cif.form_change(
  new_form_data,
  operation,
  form_data_schema_name,
  form_data_table_name,
  json_schema_name,
  project_revision_id
)
  values
(
  json_build_object(
    'projectId', 2,
    'contactId', 1,
    'contactIndex', 1
  ),
  'create', 'cif', 'project_contact', 'project_contact', 2
);

-- Delete the project form_change to create a broken foreign key constraint
delete from cif.form_change where form_data_table_name = 'project' and project_revision_id=2;

select throws_like(
  $$
    select cif.commit_project_revision(2);
  $$,
  'insert or update on table "project_contact" violates foreign key constraint%',
  'Constraints are checked at the end of the transaction and fail if a foreign key relation does not exist'
);

-- Check revision_status is correctly applied
insert into cif.project(id, project_name, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary)
overriding system value
  values (
    10,'test-project-333',
    (select id from cif.operator limit 1),
    (select id from cif.funding_stream_rfp limit 1),
    (select id from cif.project_status limit 1),
    'rfp333',
    'summary333'
  ),
  (
    11,'test-project-444',
    (select id from cif.operator limit 1),
    (select id from cif.funding_stream_rfp limit 1),
    (select id from cif.project_status limit 1),
    'rfp444',
    'summary444'
  ),
  (
    12,'test-project-555',
    (select id from cif.operator limit 1),
    (select id from cif.funding_stream_rfp limit 1),
    (select id from cif.project_status limit 1),
    'rfp555',
    'summary555'
  );

select * from cif.project_revision;

insert into cif.project_revision(project_id, change_reason, revision_type, revision_status)
values
  (10, 'reasons','Amendment','Draft'),
  (11, 'reasons','General Revision','Draft'),
  (12, 'reasons','General Revision','Draft');



select results_eq(
  $$
    select revision_type, revision_status from cif.commit_project_revision(3);
  $$,
  $$
    values ('Amendment'::varchar, 'Applied'::varchar);
  $$,
  'commit_project_revision sets revision_status to Applied when revision_type is Amendment'
);

select results_eq(
  $$
    select revision_type, revision_status from cif.commit_project_revision(4);
  $$,
  $$
    values ('General Revision'::varchar, 'Applied'::varchar);
  $$,
  'commit_project_revision sets revision_status to Applied when revision_type is General Revision'
);

-- Test the concurrent revision functinality

truncate cif.project restart identity cascade;

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

insert into cif.form_change(
  new_form_data,
  operation,
  form_data_schema_name,
  form_data_table_name,
  json_schema_name,
  project_revision_id
)
  values
(
  json_build_object(
    'projectId', 1,
    'contactId', 1,
    'contactIndex', 1
  ),
  'create', 'cif', 'project_contact', 'project_contact', 3
);

select lives_ok (
  $$
    select cif.commit_project_revision(3)
  $$,
  'The General Revision successfully commits while there is a pending Amendment on the project'
);

select lives_ok (
  $$
    select cif.commit_project_revision(2)
  $$,
  'The Amendment successfully commits after a General Revision being committed while the Amendment was pending'
);

select results_eq (
  $$
    (select project_name, summary from cif.project where id = 1 limit 1)
  $$,
  $$
    values("Correct", "Correct")
  $$,
  'The project table has the correct data after the Amendment is committed'
);

select isnt_empty (
  $$
    select id from cif.project_contact where project_id=1;
  $$,
  'The project_contact added in the General Revision was succesfully added after the Amendment was committed'
);

select finish();

rollback;
