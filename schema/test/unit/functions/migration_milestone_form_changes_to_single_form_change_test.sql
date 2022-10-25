

begin;


select plan(9);


-- Test Setup --

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
       -- first project with no data - and no expenses
       ('{"projectId": 1, "reportType": "Reporting Milestone", "reportingRequirementIndex": 1 }'::jsonb,
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

        -- second project with all the data - and expenses
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
       ('{"reportingRequirementId": 2, "substantialCompletionDate": "2021-09-29 14:24:46.318423-07",
          "certifiedBy": "A test user", "certifierProfessionalDesignation": "A very real designation",
          "maximumAmount": 123435, "totalEligibleExpenses": 12340}'::jsonb,
        'create',
        'cif',
        'milestone_report',
        null,
        2,
        'pending',
        'milestone_report') ,
       ('{"reportingRequirementId": 2, "adjustedGrossAmount": 12334,
          "adjustedNetAmount": 12333, "dateSentToCsnr": "2021-11-29 14:24:46.318423-07" }'::jsonb,
        'create',
        'cif',
        'payment',
        null,
        2,
        'pending',
        'payment'),

        -- An existing reporting requirement, different from a milestone
        ('{"projectId": 1, "reportType": "Quarterly", "reportingRequirementIndex": 1 }'::jsonb,
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

-- We can't use the cif.create_project_revision() function since it is already updated with the new milestone schema, so we create the form_changes manually.
insert into cif.project_revision(project_id, change_status) values (1, 'pending');
select cif.create_form_change(
  operation => 'update',
  json_schema_name => fc.json_schema_name,
  form_data_schema_name => 'cif',
  form_data_table_name => fc.form_data_table_name,
  form_data_record_id => fc.form_data_record_id,
  project_revision_id => 3
) from cif.form_change fc where project_revision_id = 1;


-- End Test Setup --

-- At this point, we have 3 revisions:
  -- One committed (id=1) and one pending (id=3) for the project_id=1
     -- with the milestone form_change ids being 3 and 12
  -- One pending (id=2) for the project_id=2
     -- with the milestone form_change id being 6


alter table cif.form_change disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

select cif_private.migration_milestone_form_changes_to_single_form_change();

alter table cif.form_change enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;


select is(
  (select count(*) from cif.form_change where (form_data_table_name='payment' or form_data_table_name='milestone_report') and project_revision_id is not null),
  0::bigint,
  'There are no form_change records left for the payment or milestone_report tables that are associated to a revision'
);

select is(
  (select count(*) from cif.form_change where form_data_table_name='reporting_requirement' and json_schema_name='milestone'),
  3::bigint,
  'The reporting requirements for milestones have been converted to the new schema'
);

-- it takes the milestone data from existing revisions and puts them into the new json schema
  -- for committed form changes
  -- for pending form changes
select results_eq(
  $$
    select id, change_status, new_form_data from cif.form_change where form_data_table_name='reporting_requirement' and json_schema_name='milestone' order by id;
  $$,
  $$
   values (3, 'committed'::varchar, '{"reportType": "Reporting Milestone", "hasExpenses":false, "reportingRequirementIndex": 1}'::jsonb),
          (6, 'pending'::varchar, '{  "comments": "test comments",
                                      "reportType": "General Milestone",
                                      "hasExpenses": true,
                                      "certifiedBy": "A test user",
                                      "description": "test description",
                                      "maximumAmount": 123435,
                                      "reportDueDate": "2021-09-29 14:24:46.318423-07",
                                      "submittedDate": "2021-10-29 14:24:46.318423-07",
                                      "dateSentToCsnr": "2021-11-29 14:24:46.318423-07",
                                      "adjustedNetAmount": 12333,
                                      "adjustedGrossAmount": 12334,
                                      "totalEligibleExpenses": 12340,
                                      "reportingRequirementIndex": 1,
                                      "substantialCompletionDate": "2021-09-29 14:24:46.318423-07",
                                      "certifierProfessionalDesignation": "A very real designation"}'::jsonb),
          (12, 'pending'::varchar, '{"reportType": "Reporting Milestone", "hasExpenses":false, "reportingRequirementIndex": 1}'::jsonb)

  $$,
  'It transforms the triple (reporting_requirement, milestone_report, payment) into one single form_change, without nulls, and sets the `hasExpenses` value properly'
);

-- it transforms the existing form_change for the reporting_requirement into the new format
select results_eq(
  $$
    select form_data_table_name::text, json_schema_name::text, change_status::text from cif.form_change where id in (3,6,12)
  $$,
  $$
    values ('reporting_requirement', 'milestone', 'pending'),
           ('reporting_requirement', 'milestone', 'committed'),
           ('reporting_requirement', 'milestone', 'pending')
  $$,
  'It transforms the existing reporting_requirement form_change to the milestone schema, and keeps the change_status'
);

-- it doesn't touch the form changes not in a revision
select results_eq(
  $$
    select id, new_form_data from cif.form_change where form_data_table_name='payment'
  $$,
  $$
    values (10,'{"adjustedNetAmount": 12345, "reportingRequirementId": 12}'::jsonb)
  $$,
  'It leaves the form_changes for payment and milestone_report without a project revision'
);

-- it doesn't touch the reporting requirement form changes that are not for the General, Advanced or Reporting milestones.
select is(
  (select new_form_data from cif.form_change where id=9),
  ('{"projectId": 1, "reportType": "Quarterly", "reportingRequirementIndex": 1}'::jsonb),
  'It doesn''t touch the form changes that are not for the General, Advanced or Reporting milestones.'
);

-- It is idempotent
-- We re-run the first 3 tests to make sure nothing has changed

alter table cif.form_change disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

select cif_private.migration_milestone_form_changes_to_single_form_change();

alter table cif.form_change enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;



select is(
  (select count(*) from cif.form_change where (form_data_table_name='payment' or form_data_table_name='milestone_report') and project_revision_id is not null),
  0::bigint,
  'There are no form_change records left for the payment or milestone_report tables that are associated to a revision'
);

select is(
  (select count(*) from cif.form_change where form_data_table_name='reporting_requirement' and json_schema_name='milestone'),
  3::bigint,
  'The reporting requirements for milestones have been converted to the new schema'
);

select results_eq(
  $$
    select id, change_status, new_form_data from cif.form_change where form_data_table_name='reporting_requirement' and json_schema_name='milestone' order by id;
  $$,
  $$
   values (3, 'committed'::varchar, '{"reportType": "Reporting Milestone", "hasExpenses":false, "reportingRequirementIndex": 1}'::jsonb),
          (6, 'pending'::varchar, '{  "comments": "test comments",
                                      "reportType": "General Milestone",
                                      "hasExpenses": true,
                                      "certifiedBy": "A test user",
                                      "description": "test description",
                                      "maximumAmount": 123435,
                                      "reportDueDate": "2021-09-29 14:24:46.318423-07",
                                      "submittedDate": "2021-10-29 14:24:46.318423-07",
                                      "dateSentToCsnr": "2021-11-29 14:24:46.318423-07",
                                      "adjustedNetAmount": 12333,
                                      "adjustedGrossAmount": 12334,
                                      "totalEligibleExpenses": 12340,
                                      "reportingRequirementIndex": 1,
                                      "substantialCompletionDate": "2021-09-29 14:24:46.318423-07",
                                      "certifierProfessionalDesignation": "A very real designation"}'::jsonb),
          (12, 'pending'::varchar, '{"reportType": "Reporting Milestone", "hasExpenses":false, "reportingRequirementIndex": 1}'::jsonb)

  $$,
  'It transforms the triple(reporting_requirement, milestone_report, payment) into one single form_change, without nulls, and sets the `hasExpenses` value properly'
);



select finish();

rollback;
