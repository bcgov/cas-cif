begin;

select plan(19);


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
select cif.commit_project_revision(1);

-- create the amendment that will be "pending"
select cif.create_project_revision(1, 'Amendment'); -- id = 2
select cif.add_contact_to_revision(2, 1, 1);
select cif.create_form_change(
  'create',
  'emission_intensity',
  'cif',
  'reporting_requirement',
  json_build_object(
      'baselineEmissionIntensity', 1,
      'targetEmissionIntensity', 2,
      'postProjectEmissionIntensity', 3,
      'totalLifetimeEmissionReduction', 4
      )::jsonb,
  null,
  2
);
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
  2
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
  2
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
  2
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
  2
);
select cif.add_project_attachment_to_revision(2,1);

-- create the general revision that will be "committing"
select cif.create_project_revision(1, 'General Revision'); -- id = 3
select cif.add_contact_to_revision(3, 1, 2);
select cif.create_form_change(
  'create',
  'emission_intensity',
  'cif',
  'reporting_requirement',
  json_build_object(
      'baselineEmissionIntensity', 5,
      'targetEmissionIntensity', 6,
      'postProjectEmissionIntensity', 7,
      'totalLifetimeEmissionReduction', 8
      )::jsonb,
  null,
  3
);
select cif.create_form_change(
  'create',
  'funding_parameter_EP',
  'cif',
  'funding_parameter',
  json_build_object(
      'projectId', 1,
      'provinceSharePercentage', 2
      )::jsonb,
  null,
  3
);
select cif.create_form_change(
  'create',
  'project_manager',
  'cif',
  'project_manager',
  json_build_object(
      'projectManagerLabelId', 1,
      'cifUserId', 2,
      'projectId', 1
      )::jsonb,
  null,
  3
);
select cif.create_form_change(
  'create',
  'project_manager',
  'cif',
  'project_manager',
  json_build_object(
      'projectManagerLabelId', 2,
      'cifUserId', 1,
      'projectId', 1
      )::jsonb,
  null,
  3
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
  3
);
select cif.create_form_change(
  'create',
  'reporting_requirement',
  'cif',
  'reporting_requirement',
  json_build_object(
      'reportType', 'Quarterly',
      'reportingRequirementIndex', 2,
      'projectId', 1
      )::jsonb,
  null,
  3
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
  3
);
select cif.create_form_change(
  'create',
  'milestone',
  'cif',
  'reporting_requirement',
  json_build_object(
      'reportType', 'General Milestone',
      'reportingRequirementIndex', 2
      )::jsonb,
  null,
  3
);
select cif.add_project_attachment_to_revision(3,2);

select cif.commit_project_revision(3);

select is (
  (select count(*) from cif.form_change where project_revision_id = 2 and json_schema_name = 'funding_parameter_EP'),
  1::bigint,
  'When committing and pending have both created a funding parameter form, only one exists in pending after the first is commit'
);

select is (
  (select (new_form_data ->> 'provinceSharePercentage')::int from cif.form_change where project_revision_id = 2 and json_schema_name = 'funding_parameter_EP'),
  1,
  'When committing and pending have both created a funding parameter form, pending maintains its form values'
);

select is (
  (select count(*) from cif.form_change where project_revision_id = 2 and json_schema_name = 'emission_intensity'),
  1::bigint,
  'When committing and pending have both created an emission intensity report form, only one exists in pending after the first is commit'
);

select is (
  (select (new_form_data ->> 'baselineEmissionIntensity')::int from cif.form_change where project_revision_id = 2 and json_schema_name = 'emission_intensity'),
  1,
  'When committing and pending have both created an emission intensity report, pending maintains its form values'
);

select is (
  (select count(*) from cif.form_change where project_revision_id = 2 and json_schema_name = 'project_contact'),
  2::bigint,
  'When committing and pending both create a primary contact, the correct nuber of contacts exist in pending'
);

select is (
  (select (new_form_data->>'contactId')::int from cif.form_change where project_revision_id = 2 and json_schema_name = 'project_contact' and new_form_data->>'contactIndex' = '1'),
  1,
  'When committing and pending both create a primary contact, the pending primary contact contactId maintains its value'
);

select is (
  (select (new_form_data->>'contactId')::int from cif.form_change where project_revision_id = 2 and json_schema_name = 'project_contact' and new_form_data->>'contactIndex' = '2'),
  2,
  'When committing and pending both create a primary contact, the committing primary becomes the amendments secondary contact'
);

-- project_manager
select is (
  (select operation from cif.form_change where project_revision_id = 2 and json_schema_name = 'project_manager' and new_form_data->>'projectManagerLabelId' = '1'),
  'update',
  'When committing and pending both create a project manager with the same projectManagerLabelId, pendings operation becomes update'
);

select is (
  (select (new_form_data->>'cifUserId')::int from cif.form_change where project_revision_id = 2 and json_schema_name = 'project_manager' and new_form_data->>'projectManagerLabelId' = '1'),
  1,
  'When committing and pending both create a project manager with the same projectManagerLabelId, the value of cifUserId in pending remains unchanged'
);

select is (
  (select count(*) from cif.form_change where project_revision_id = 2 and json_schema_name = 'project_manager'),
  2::bigint,
  'When committing and pending both create a project managers with different labels, all created manager labels persist to the pending form change'
);

-- Quarterly Reports
select is (
  (select count(*) from cif.form_change where project_revision_id = 2 and new_form_data->>'reportType' = 'Quarterly'),
  3::bigint,
  'When committing and pending both create Quarterly reports, all of them are kept after the commit'
);

select is (
  (select count(*) from cif.form_change where project_revision_id = 2 and new_form_data->>'reportType' = 'Quarterly' and (new_form_data->>'reportingRequirementIndex')::int = 1),
  1::bigint,
  'When committing and pending both create Quarterly reports, reportingRequirementIndexes are not doubled up'
);

select is (
  (select max((new_form_data->>'reportingRequirementIndex')::int) from cif.form_change where project_revision_id = 2 and new_form_data->>'reportType' = 'Quarterly'),
  3,
  'When committing and pending both create Quarterly reports, the indexes of those in pending are adjusted on commit'
);

-- Milestones
select is (
  (select count(*) from cif.form_change where project_revision_id = 2 and new_form_data->>'reportType' = 'General Milestone'),
  3::bigint,
  'When committing and pending both create General Milestone reports, all of them are kept after the commit'
);

select is (
  (select count(*) from cif.form_change where project_revision_id = 2 and new_form_data->>'reportType' = 'General Milestone' and (new_form_data->>'reportingRequirementIndex')::int = 1),
  1::bigint,
  'When committing and pending both create General Milestone reports, reportingRequirementIndexes are not doubled up'
);

select is (
  (select max((new_form_data->>'reportingRequirementIndex')::int) from cif.form_change where project_revision_id = 2 and new_form_data->>'reportType' = 'General Milestone'),
  3,
  'When committing and pending both create General Milestone reports, the next sequential index is assigned to the milestone form_change record being added in pending.'
);

select is (
  (select max(counts.index_count) from (
    select count(*) as index_count from cif.form_change
      where project_revision_id = 2 and new_form_data->>'reportType' = 'General Milestone'
      group by new_form_data->>'reportingRequirementIndex') as counts
  ),
  1::bigint,
  'When committing and pending both create General Milestone reports, each milestone is given a unique reportingRequirementIndex.'
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
