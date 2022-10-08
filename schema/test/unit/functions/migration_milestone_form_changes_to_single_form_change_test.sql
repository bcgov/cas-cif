

begin;


select no_plan();


-- setup

truncate table cif.project restart identity cascade;

insert into cif.operator(id, legal_name) overriding system value values (1, 'Test Operator');
insert into cif.form(slug, json_schema, description) values ('milestone_report', '{}', 'test'), ('payment', '{}', 'test');

select cif.create_project();
select cif.create_project();
update cif.form_change
  set new_form_data=jsonb_build_object(
      'operatorId', 1,
      'fundingStreamRfpId', 1,
      'projectStatusId', 1,
      'proposalReference', 'TESTREF-' || id,
      'summary', 'lorem ipsum dolor sit amet adipiscing eli',
      'projectName', 'Test Project',
      'totalFundingRequest', 1000000,
      'sectorName', 'Agriculture',
      'projectType', 'Carbon Capture',
      'score', 50
      )
  where form_data_table_name='project';


insert into cif.form_change(
      new_form_data,
      operation,
      form_data_schema_name,
      form_data_table_name,
      form_data_record_id,
      project_revision_id,
      change_status,
      json_schema_name
    )
values
       -- first project with no data
       ('{"projectId": 1, "reportType": "General Milestone", "reportingRequirementIndex": 1 }'::jsonb,
        'create',
        'cif',
        'reporting_requirement',
        1,
        1,
        'pending',
        'reporting_requirement'),
       ('{"reportingRequirementId": 1 }'::jsonb,
        'create',
        'cif',
        'milestone_report',
        null,
        1,
        'pending',
        'milestone_report') ,
       ('{"reportingRequirementId": 1 }'::jsonb,
        'create',
        'cif',
        'payment',
        null,
        1,
        'pending',
        'payment'),

        -- second project with all the data
        ('{"projectId": 2, "reportType": "General Milestone", "reportingRequirementIndex": 1,
           "reportDueDate": "2021-09-29 14:24:46.318423-07", "submittedDate": "2021-10-29 14:24:46.318423-07",
           "comments": "test comments", "description": "test description"}'::jsonb,
        'create',
        'cif',
        'reporting_requirement',
        2,
        2,
        'pending',
        'reporting_requirement'),
       ('{"reportingRequirementId": 1, "substantialCompletionDate": "2021-09-29 14:24:46.318423-07",
          "certifiedBy": "A test user", "certifierProfessionalDesignation": "A very real designation",
          "maximumAmount": 123435, "totalEligibleExpenses": 12340}'::jsonb,
        'create',
        'cif',
        'milestone_report',
        null,
        2,
        'pending',
        'milestone_report') ,
       ('{"reportingRequirementId": 1, "adjustedGrossAmount": 12334,
          "adjustedNetAmount": 12333, "dateSentToCsnr": "2021-11-29 14:24:46.318423-07" }'::jsonb,
        'create',
        'cif',
        'payment',
        null,
        2,
        'pending',
        'payment'),

        -- An existing reporting requirement, different from a milestone
        ('{"project_id": 1, "reportType": "Quarterly", "reportingRequirementIndex": 1 }'::jsonb,
        'create',
        'cif',
        'reporting_requirement',
        3,
        1,
        'pending',
        'reporting_requirement'),

        -- A separate form change without a revision that should be left untouched
        -- even if it makes little sense, context-wise
        (
          '{"reportingRequirementId": 12, "adjustedNetAmount": 12345 }'::jsonb,
          'create',
          'cif',
          'payment',
          null,
          null,
          'committed',
          'payment');

select cif.commit_project_revision(1);

-- We can't use the cif.create_project_revision() function since it is already updated, so we create the form_changes manually.
insert into cif.project_revision(project_id, change_status) values (1, 'pending');
select cif.create_form_change(
  operation => 'update',
  form_data_schema_name => 'cif',
  form_data_table_name => fc.form_data_table_name,
  form_data_record_id => fc.id,
  project_revision_id => 2,
  json_schema_name => fc.json_schema_name
) from cif.form_change fc where project_revision_id = 1;


select is(
  (select count(*) from cif.form_change where form_data_table_name='payment' or form_data_table_name='milestone_report'),
  0::bigint,
  'There are no form_change records left for the payment or milestone_report tables'
);

-- it takes the milestone data from existing revisions and puts them into the new json schema
  -- for committed form changes
  -- for pending form changes
select results_eq(
  $$
    select id, new_form_data from cif.form_change where form_data_table_name='reporting_requirement';
  $$,
  $$
   values (0, '{}'::jsonb)
  $$,
  'it transforms the triple(reporting_requirement, milestone_report, payment) into one single form_change'
);

-- it removes null values from the form data

-- it archives both form_changes for milestone_report and payment tables

-- it transforms the existing form_change for the reporting_requirement into the new format

-- it doesn't touch the form changes not in a revision

-- it doesn't touch the form changes that are not for the General, Advanced or Reporting milestones.

-- it is idempotent




select finish();

rollback;
