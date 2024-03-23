begin;

select plan(9);

/*
  Test when the committing project_revision creates records that do not exist in the pending project_revision
*/

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

-- create the amendment that will be "pending"
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

-- create the general revision that will be "committing"
select cif.create_project_revision(1, 'General Revision'); -- id = 3
select cif.add_contact_to_revision(3, 1, 1);
select cif.add_project_attachment_to_revision(3,1);
select cif.create_form_change(
        'create',
        'funding_parameter_EP',
        'cif',
        'funding_parameter',
        json_build_object(
            'projectId', 1,
            'provinceSharePercentage', 50,
            'holdbackPercentage', 10,
            'maxFundingAmount', 1,
            'anticipatedFundingAmount', 1,
            'proponentCost',777,
            'contractStartDate', '2022-03-01 16:21:42.693489-07',
            'projectAssetsLifeEndDate', '2022-03-01 16:21:42.693489-07'
            )::jsonb,
        null,
        3
      );

select cif.commit_project_revision(3);

select is (
  (select new_form_data from cif.form_change where project_revision_id = 2 and form_data_table_name = 'project_contact'),
  '{"contactId": 1, "projectId": 1, "contactIndex": 1}'::jsonb,
  'When the committing form change is creating a project contact, the contact also gets created in the pending revision'
);

select is (
  (select previous_form_change_id from cif.form_change where project_revision_id = 2 and form_data_table_name = 'project_contact'),
  4::int,
  'When committing form change has an operation of create, the pending form change that is created gets the committing form_change id as its previous form change'
);

select is (
  (select form_data_record_id from cif.form_change where project_revision_id = 2 and form_data_table_name = 'project_attachment'),
  (select form_data_record_id from cif.form_change where project_revision_id = 3 and form_data_table_name = 'project_attachment'),
  'When committing has an operation of create, the form_data_record_id propogates to the pending form change for attachments'
);

select is (
  (select form_data_record_id from cif.form_change where project_revision_id = 2 and form_data_table_name = 'project_contact'),
  (select form_data_record_id from cif.form_change where project_revision_id = 3 and form_data_table_name = 'project_contact'),
  'When committing has an operation of create, the form_data_record_id propogates to the pending form change for contacts'
);

select is (
  (select count(*) from cif.form_change where project_revision_id = 2 and form_data_table_name = 'project_attachment'),
  1::bigint,
  'When the committing form change is creating a project attachment, the attachment also gets created in the pending revision'
);

select is (
  (select form_data_record_id from cif.form_change where project_revision_id = 2 and form_data_table_name = 'funding_parameter_EP'),
  (select form_data_record_id from cif.form_change where project_revision_id = 3 and form_data_table_name = 'funding_parameter_EP'),
  'When committing has an operation of create, the form_data_record_id propogates to the pending form change for funding parameter form'
);

select is (
  (select new_form_data from cif.form_change where project_revision_id = 2 and form_data_table_name = 'funding_parameter_EP'),
  (select new_form_data from cif.form_change where project_revision_id = 3 and form_data_table_name = 'funding_parameter_EP'),
  'When committing has an operation of create, the new_form_data propogates to the pending form change for funding parameter form'
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
