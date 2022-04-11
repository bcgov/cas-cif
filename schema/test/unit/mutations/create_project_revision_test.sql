begin;
select no_plan();

-- restart the id sequences
truncate table
cif.project, cif.project_contact,
cif.project_manager, cif.project_revision,
cif.operator, cif.contact, cif.form_change, cif.attachment
restart identity;

insert into cif.cif_user(id, uuid, given_name, family_name)
overriding system value
values (1, '11111111-1111-1111-1111-111111111111'::uuid, 'test', 'testerson');

insert into cif.contact(given_name, family_name, email)
values ('bob', 'loblaw', 'bob@loblaw.com');

insert into cif.operator(legal_name)
values ('test operator');

select cif.create_project();

update cif.form_change
set new_form_data =
'{
  "projectName": "name",
  "summary": "lorem ipsum",
  "fundingStreamRfpId": 1,
  "projectStatusId": 1,
  "proposalReference": "1235",
  "operatorId": 1
}'::jsonb
where form_data_table_name = 'project';

update cif.form_change
set new_form_data =
'{
  "contactId": 1,
  "contactIndex": 0,
  "projectId": 1
}'::jsonb
where form_data_table_name = 'project_contact';

update cif.form_change
set new_form_data =
'{
  "cifUserId": 1,
  "projectId": 1,
  "projectManagerLabelId": 1
}'::jsonb
where form_data_table_name = 'project_manager';

update cif.project_revision set change_status = 'committed';

select results_eq(
  $$
  select id, project_id, change_status from cif.create_project_revision(1)
  $$,
  $$
  values (2, 1, 'pending'::varchar)
  $$
);

select results_eq(
  $$
  select new_form_data from cif.form_change
  where form_data_table_name = 'project' and project_revision_id = 2
  $$,
  $$
  select new_form_data from cif.form_change
  where form_data_table_name = 'project' and project_revision_id = 1
  $$,
  'creating a new project revision should create a form_change record for the project'
);

select results_eq(
  $$
  select new_form_data from cif.form_change
  where form_data_table_name = 'project_manager' and project_revision_id = 2
  $$,
  $$
  select new_form_data from cif.form_change
  where form_data_table_name = 'project_manager' and project_revision_id = 1
  $$,
  'creating a new project revision should create a form_change record for the project_manager'
);

select results_eq(
  $$
  select new_form_data from cif.form_change
  where form_data_table_name = 'project_contact' and project_revision_id = 2
  $$,
  $$
  select new_form_data from cif.form_change
  where form_data_table_name = 'project_contact' and project_revision_id = 1
  $$,
  'creating a new project revision should create a form_change record for the project_contact'
);

select results_eq(
$$
  select distinct operation from cif.form_change
  where project_revision_id = 2
$$,
$$
  values ('update'::cif.form_change_operation)
$$,
'the new form_change records created for the project revision should have an update operation'
);

select finish();
rollback;
