begin;
select plan (14);

-- restart the id sequences
truncate table
cif.project,
cif.project_contact,
cif.project_manager,
cif.project_revision,
cif.emission_intensity_report,
cif.milestone_report,
cif.operator,
cif.contact,
cif.form_change,
cif.attachment,
cif.reporting_requirement,
cif.payment,
cif.funding_parameter,
cif.additional_funding_source,
cif.project_revision_amendment_type,
cif.project_attachment
restart identity;

select * from cif.cif_user;

insert into cif.cif_user(id, session_sub, given_name, family_name)
overriding system value
values (1, '11111111-1111-1111-1111-111111111111'::varchar, 'test', 'testerson');

insert into cif.contact(given_name, family_name, email)
values ('bob', 'loblaw', 'bob@loblaw.com');

insert into cif.operator(legal_name)
values ('test operator');

select cif.create_project(1);

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
    }','create','cif','reporting_requirement',null,1,'pending','milestone');

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
    "reportType": "Annual",
    "reportingRequirementIndex": 1
    }','create','cif','reporting_requirement',null,1,'pending','reporting_requirement');

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
    "adjustedEmissionsIntensityPerformance": 98,
    "baselineEmissionIntensity": 324.25364,
    "comments": "comments",
    "dateSentToCsnr": "2023-07-01T00:00:00-07:00",
    "emissionFunctionalUnit":"tCO2e",
    "measurementPeriodEndDate":"2023-07-01T00:00:00-07:00",
    "measurementPeriodStartDate": "2023-06-01T00:00:00-07:00",
    "postProjectEmissionIntensity": 124.35,
    "productionFunctionalUnit": "unit",
    "reportDueDate": "2023-06-15T00:00:00-07:00",
    "reportType": "TEIMP",
    "reportingRequirementIndex": 1,
    "submittedDate": "2023-06-30T00:00:00-07:00",
    "targetEmissionIntensity": 23.2357,
    "totalLifetimeEmissionReduction": 44.4224
    }','create','cif','reporting_requirement',null,1,'pending','emission_intensity');

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
    "reportType": "Project Summary Report",
    "reportDueDate": "2021-08-31 14:24:46.318423-07",
    "submittedDate": "2021-08-31 14:24:46.318423-07",
    "comments": "comments",
    "reportingRequirementIndex": 1,
    "projectSummaryReportPayment": 111,
    "paymentNotes": "payment notes",
    "dateSentToCsnr": "2021-08-29 14:24:46.318423-07"
    }','create','cif','reporting_requirement',null,1,'pending','project_summary_report');

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
    "attachmentId": 1
    }','create','cif','project_attachment',null,1,'pending','project_attachment');

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

insert into cif.attachment(description)
values ('test-file-description');

select cif.commit_project_revision(1);

select results_eq(
  $$
  select id, project_id, change_status, revision_type, revision_status from cif.create_project_revision(1, 'Amendment')
  $$,
  $$
  values (2, 1, 'pending'::varchar, 'Amendment'::varchar, 'In Discussion'::varchar)
  $$,
  'creating a project revision with revision type as Amendment creates a new project revision in pending state, with revision type as Amendment, and with revision_status In Discussion'
);

update cif.project_revision set change_reason = 'changing because of reasons' where id = 2;
select cif.commit_project_revision(2);

select results_eq(
  $$
  select id, project_id, change_status, revision_type from cif.create_project_revision(1, 'General Revision', array ['Cost'])
  $$,
  $$
  values (3, 1, 'pending'::varchar, 'General Revision'::varchar)
  $$,
  'creating a project revision with amendment types array creates a new project revision in pending state'
);
select results_eq(
  $$
  select id, amendment_type from cif.project_revision_amendment_type where project_revision_id = 3
  $$,
  $$
  values (1, 'Cost'::varchar)
  $$,
  'creating a project revision also create project_revision_amendment_type records'
);
update cif.project_revision set change_reason = 'changing because of reaons' where id = 3;
select cif.commit_project_revision(3);

select results_eq(
  $$
  select id, project_id, change_status, revision_type, revision_status from cif.create_project_revision(1)
  $$,
  $$
  values (4, 1, 'pending'::varchar, 'General Revision'::varchar, 'Draft'::varchar)
  $$,
  'creating a project revision without revision type and creates a new project revision in pending state and defaults revision_type to General Revision and revision_status to Draft'
);

select results_eq(
  $$
  select form_data_record_id, previous_form_change_id, new_form_data from cif.form_change
  where form_data_table_name = 'project' and project_revision_id = 2
  $$,
  $$
  values(1,1, '{
    "projectName": "name",
    "summary": "lorem ipsum",
    "fundingStreamRfpId": 1,
    "projectStatusId": 1,
    "proposalReference": "1235",
    "operatorId": 1
  }'::jsonb)
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
    select form_data_record_id, previous_form_change_id, new_form_data, json_schema_name from cif.form_change
    where form_data_table_name = 'reporting_requirement' and project_revision_id = 2
    order by json_schema_name
  $$,
  $$
  values
    (3,5,'{
      "projectId":1,
      "adjustedEmissionsIntensityPerformance": 98,
      "baselineEmissionIntensity": 324.25364,
      "comments": "comments",
      "dateSentToCsnr": "2023-07-01T00:00:00-07:00",
      "emissionFunctionalUnit":"tCO2e",
      "measurementPeriodEndDate":"2023-07-01T00:00:00-07:00",
      "measurementPeriodStartDate": "2023-06-01T00:00:00-07:00",
      "postProjectEmissionIntensity": 124.35,
      "productionFunctionalUnit": "unit",
      "reportDueDate": "2023-06-15T00:00:00-07:00",
      "reportType": "TEIMP",
      "reportingRequirementIndex": 1,
      "submittedDate": "2023-06-30T00:00:00-07:00",
      "targetEmissionIntensity": 23.2357,
      "totalLifetimeEmissionReduction": 44.4224
      }'::jsonb, 'emission_intensity'::varchar),
    (1,3,'{
      "projectId":1,
      "reportType": "General Milestone",
      "reportingRequirementIndex": 1
      }'::jsonb, 'milestone'::varchar),
    (4,6,'{
      "projectId":1,
      "reportType": "Project Summary Report",
      "reportDueDate": "2021-08-31 14:24:46.318423-07",
      "submittedDate": "2021-08-31 14:24:46.318423-07",
      "comments": "comments",
      "reportingRequirementIndex": 1,
      "projectSummaryReportPayment": 111,
      "paymentNotes": "payment notes",
      "dateSentToCsnr": "2021-08-29 14:24:46.318423-07"
      }'::jsonb, 'project_summary_report'::varchar),
    (2,4,'{
      "projectId":1,
      "reportType": "Annual",
      "reportingRequirementIndex": 1
      }'::jsonb, 'reporting_requirement'::varchar)
  $$,
  'creating a new project revision should create a form_change record for the reporting_requirement, for the milestone schema, generic reporting_requirement schema, emission_intensity and project_summary_report schemas'
);

select results_eq(
  $$
  select new_form_data from cif.form_change
  where form_data_table_name = 'project_attachment' and project_revision_id = 2
  $$,
  $$
  select '{
    "projectId":1,
    "attachmentId":1
    }'::jsonb
  $$,
  'creating a new project revision should create a form_change record for the project_attachment'
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
    select cif.create_project_revision(1, 'General Revision')
  $$,
  'duplicate key value violates unique constraint%',
  'prevents creating a pending General Revision on a project_id that already has a pending General Revision'
);

select lives_ok(
  $$
    select cif.create_project_revision(1, 'Amendment')
  $$,
  'allows creating a pending Amendment on a project a pending General Revision'
);

delete from cif.project_revision where project_id = 1 and change_status = 'pending' and revision_type = 'General Revision';

select throws_like(
  $$
    select cif.create_project_revision(1, 'Amendment')
  $$,
  'duplicate key value violates unique constraint%',
  'prevents creating a pending Amendment on a project_id that already has a pending Amendment'
);

select lives_ok(
  $$
    select cif.create_project_revision(1, 'General Revision')
  $$,
  'allows creating a pending General Revision on a project with a pending Amendment'
);

select finish();
rollback;
