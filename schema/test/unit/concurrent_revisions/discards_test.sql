begin;

select plan(7);


truncate table cif.project, cif.operator, cif.contact, cif.attachment restart identity cascade;
insert into cif.operator(legal_name) values ('test operator');
insert into cif.contact(given_name, family_name, email) values ('John', 'Test', 'foo@abc.com'), ('Sandy', 'Olson', 'bar@abc.com');
insert into cif.attachment (description, file_name, file_type, file_size)
  values ('description1', 'file_name1', 'file_type1', 100), ('description2', 'file_name2', 'file_type1', 100);
insert into cif.cif_user(id, session_sub, given_name, family_name)
  overriding system value
  values (1, '11111111-1111-1111-1111-111111111111', 'Jan','Jansen'),
         (2, '22222222-2222-2222-2222-222222222222', 'Max','Mustermann'),
         (3, '33333333-3333-3333-3333-333333333333', 'Eva', 'Nováková');

-- Create a project to update.
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

select cif.add_contact_to_revision(1, 1, 1);
select cif.add_contact_to_revision(1, 2, 2);
select cif.add_project_attachment_to_revision(1,1);
select cif.create_form_change(
  'create',
  'funding_parameter_EP',
  'cif',
  'funding_parameter',
  json_build_object(
      'projectId', 1,
      'provinceSharePercentage', 1
      )::jsonb,
  null,
  1
);
select cif.create_form_change(
  'create',
  'project_manager',
  'cif',
  'project_manager',
  json_build_object(
      'projectManagerLabelId', 1,
      'cifUserId', 1,
      'projectId', 1
      )::jsonb,
  null,
  1
);
select cif.create_form_change(
  'create',
  'reporting_requirement',
  'cif',
  'reporting_requirement',
  json_build_object(
      'reportType', 'Quarterly',
      'reportingRequirementIndex', 1,
      'projectId', 1
      )::jsonb,
  null,
  1
);
select cif.create_form_change(
  'create',
  'milestone',
  'cif',
  'reporting_requirement',
  json_build_object(
      'reportType', 'General Milestone',
      'reportingRequirementIndex', 1
      )::jsonb,
  null,
  1
);
select cif.commit_project_revision(1);

-- create the amendment that will be "pending"
select cif.create_project_revision(1, 'Amendment'); -- id = 2

-- create the general revision that will be "committing"
select cif.create_project_revision(1, 'General Revision'); -- id = 3

update cif.form_change set operation = 'archive'
  where project_revision_id=3
    and json_schema_name='project_contact'
    and new_form_data ->> 'contactIndex' = '2';

update cif.form_change set operation = 'archive'
  where project_revision_id=3
    and json_schema_name='reporting_requirement'
    and new_form_data ->> 'reportType' = 'Quarterly';

update cif.form_change set operation = 'archive'
  where project_revision_id=3
    and json_schema_name='project_manager';

update cif.form_change set operation = 'archive'
  where project_revision_id=3
    and json_schema_name='milestone';

select cif.discard_funding_parameter_form_change(3);

select cif.discard_project_attachment_form_change(
  (select id from cif.form_change where project_revision_id = 3 and form_data_table_name = 'project_attachment')
);

select cif.commit_project_revision(3);

select is (
  (select count(*) from cif.form_change where project_revision_id = 2 and json_schema_name = 'project_contact'),
  1::bigint,
  'When the committing form change archives a project contact, the corresponding form change in the pending revision on that project is deleted'
);

select is (
  (select count(*) from cif.form_change where project_revision_id = 2 and json_schema_name = 'reporting_requirement' and new_form_data ->> 'reportType' = 'Quarterly'),
  0::bigint,
  'When the committing form change archives a quarterly report, the corresponding form change in the pending revision on that project is deleted'
);

select is (
  (select count(*) from cif.form_change where project_revision_id = 2 and json_schema_name = 'project_manager'),
  0::bigint,
  'When the committing form change removes a project manager, the corresponding form change in the pending revision on that project is deleted'
);

select is (
  (select count(*) from cif.form_change where project_revision_id = 2 and json_schema_name = 'funding_parameter_EP'),
  0::bigint,
  'When the committing form change discards the emission intensity report, the corresponding form change in the pending revision on that project is deleted'
);

select is (
  (select count(*) from cif.form_change where project_revision_id = 2 and form_data_table_name = 'project_attachment'),
  0::bigint,
  'When the committing form change is discarding a project attachment, the pending fc is deleted.'
);

-- Commit the pending ammednment

select lives_ok (
  $$
    select cif.commit_project_revision(2)
  $$,
  'Committing the pending project_revision does not throw an error'
);

select is (
  (select count(*) from cif.form_change where form_data_record_id is null),
  0::bigint,
  'All of the committed form_change records have a form_data_record_id assigned after pending is committed.'
);


select finish();

rollback;
