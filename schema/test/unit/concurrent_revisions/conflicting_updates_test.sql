begin;

select plan(5);

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

-- Commit the pending ammednment

select lives_ok (
  $$
    select cif.commit_project_revision(2)
  $$,
  'Committing the pending project_revision does not throw an error'
);



select finish();

rollback;
