begin;

select plan(4);

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
select cif.create_project_revision(1, 'General Revision'); -- id = 3
update cif.form_change set new_form_data='{
      "projectName": "Correct only newer",
      "summary": "Correct",
      "fundingStreamRfpId": 1,
      "projectStatusId": 1,
      "proposalReference": "1233",
      "operatorId": 1
    }'::jsonb
  where project_revision_id=3
    and form_data_table_name='project';

select cif.discard_project_attachment_form_change((select id from cif.form_change where project_revision_id = 3 and form_data_table_name = 'project_attachment'));

select cif.commit_project_revision(3);

select is (
  (select new_form_data->>'projectName' from cif.form_change where project_revision_id = 2 and form_data_table_name = 'project'),
  'Correct only newer',
  'The pending form change should have the value from the committing form change'
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
  (select project_name from cif.project where id = 1),
  'Correct only newer',
  'The project table should have the updated proejct name, even after the pending amendment is committed'
);



select finish();

rollback;
