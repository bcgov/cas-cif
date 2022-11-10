begin;
select no_plan();

-- restart the id sequences
truncate table
cif.project, cif.project_contact,
cif.project_manager, cif.project_revision, cif.emission_intensity_report, cif.milestone_report,
cif.operator, cif.contact, cif.form_change, cif.attachment, cif.reporting_requirement, cif.payment, cif.funding_parameter, cif.additional_funding_source, cif.project_revision_amendment_type
restart identity;

insert into cif.cif_user(id, session_sub, given_name, family_name)
overriding system value
values (1, '11111111-1111-1111-1111-111111111111'::varchar, 'test', 'testerson');

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


update cif.project_revision set change_reason = 'changing because of reasons' where id = 2;
select cif.create_project_revision(1, 'General Revision', array ['Cost']);

select isnt_empty(
  $$
  select * from cif.project_revision where id = 2
  $$,
  'create_project_revision creates a new project revision'
);
select results_eq(
  $$
  select cif.project_revision_amendment_type.amendment_type from cif.project_revision_amendment_type where project_revision_id =2;
  $$,
  $$
  select name from cif.amendment_type where name='Cost';
  $$,
  'creating a project revision should create a project_revision_amendment_type record and link to the correct amendment_type'
);



select cif.delete_project_revision_and_amendments(2);
select is_empty(
  $$
  select * from cif.project_revision where id = 2
  $$,
  'project revision is deleted'
);
select is_empty(
  $$
  select * from cif.project_revision_amendment_type where project_revision_id = 2
  $$,
  'project revision amendment types are deleted'
);

select finish();
rollback;
