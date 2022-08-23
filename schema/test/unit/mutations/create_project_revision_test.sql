begin;
select no_plan();

-- restart the id sequences
truncate table
cif.project, cif.project_contact,
cif.project_manager, cif.project_revision, cif.emission_intensity_report, cif.milestone_report,
cif.operator, cif.contact, cif.form_change, cif.attachment, cif.reporting_requirement, cif.payment, cif.funding_parameter, cif.additional_funding_source
restart identity;

insert into cif.cif_user(id, uuid, given_name, family_name)
overriding system value
values (1, '11111111-1111-1111-1111-111111111111'::uuid, 'test', 'testerson');

insert into cif.contact(given_name, family_name, email)
values ('bob', 'loblaw', 'bob@loblaw.com');

insert into cif.operator(legal_name)
values ('test operator');

select cif.create_project();

insert into cif.form_change(new_form_data,
    operation,
    form_data_schema_name,
    form_data_table_name,
    form_data_record_id,
    project_revision_id,
    change_status,
    json_schema_name)
    values
    ('{"projectId":1,"cifUserId":1,"projectManagerLabelId":1}','create','cif','project_manager',null,1,'pending','project_manager');

insert into cif.form_change(new_form_data,
    operation,
    form_data_schema_name,
    form_data_table_name,
    form_data_record_id,
    project_revision_id,
    change_status,
    json_schema_name)
    values
    ('{
    "projectId":1,
    "reportType": "General Milestone",
    "reportingRequirementIndex": 1
    }','create','cif','reporting_requirement',null,1,'pending','reporting_requirement');

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

select cif.commit_project_revision(1);

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
  select '{
    "projectName": "name",
    "summary": "lorem ipsum",
    "fundingStreamRfpId": 1,
    "projectStatusId": 1,
    "proposalReference": "1235",
    "operatorId": 1
  }'::jsonb
  $$,
  'creating a new project revision should create a form_change record for the project'
);

select results_eq(
  $$
  select new_form_data from cif.form_change
  where form_data_table_name = 'project_manager' and project_revision_id = 2
  $$,
  $$
  select '{
    "projectId":1,
    "cifUserId":1,
    "projectManagerLabelId":1
    }'::jsonb
  $$,
  'creating a new project revision should create a form_change record for the project_manager'
);

select is_empty(
  $$
  select new_form_data from cif.form_change
  where form_data_table_name = 'project_contact' and project_revision_id = 2
  $$,
  'creating a new project revision should not create a form_change record for the project_contact'
);

select results_eq(
  $$
  select new_form_data from cif.form_change
  where form_data_table_name = 'reporting_requirement' and project_revision_id = 2
  $$,
  $$
  select '{
    "projectId":1,
    "reportType": "General Milestone",
    "reportingRequirementIndex": 1
    }'::jsonb
  $$,
  'creating a new project revision should create a form_change record for the reporting_requirement'
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

select throws_like(
  $$
    select cif.create_project_revision(1)
  $$,
    'duplicate key value violates unique constraint%',
    'cannot create a pending project revision on a project_id that already has a pending revision'
);

select finish();
rollback;
