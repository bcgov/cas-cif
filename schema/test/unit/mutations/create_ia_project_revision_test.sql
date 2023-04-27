begin;
select plan (2);

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

select cif.create_project(5);

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
    "reportType": "Project Summary Report",
    "reportingRequirementIndex": 1
    }','create','cif','reporting_requirement',null,1,'pending','project_summary_report');

update cif.form_change
set new_form_data =
'{
  "projectName": "name",
  "summary": "lorem ipsum",
  "fundingStreamRfpId": 5,
  "projectStatusId": 1,
  "proposalReference": "1235",
  "operatorId": 1
}'::jsonb
where form_data_table_name = 'project';

select cif.commit_project_revision(1);

select results_eq(
  $$
  select id, project_id, change_status, revision_type, revision_status from cif.create_project_revision(1)
  $$,
  $$
  values (2, 1, 'pending'::varchar, 'General Revision'::varchar, 'Draft'::varchar)
  $$,
  'creating a project revision without revision type creates a new project revision in pending state, with revision type as default General Revision, and with revision_status Draft'
);

select results_eq(
  $$
    select new_form_data, json_schema_name from cif.form_change
    where form_data_table_name = 'reporting_requirement' and project_revision_id = 2
    order by json_schema_name
  $$,
  $$
  values
    ('{
      "projectId":1,
      "reportType": "Project Summary Report",
      "reportingRequirementIndex": 1
      }'::jsonb, 'project_summary_report'::varchar)
  $$,
  'creating a new project revision should create a form_change record for the reporting_requirement, for the project_summary_report schema'
);

select finish();
rollback;
