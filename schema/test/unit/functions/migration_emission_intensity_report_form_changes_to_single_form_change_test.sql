

begin;


select plan(5);

-- Test Setup --

truncate table cif.project restart identity cascade;

insert into cif.operator(id, legal_name) overriding system value values (1, 'Test Operator');

select cif.create_project(1);
select cif.create_project(1);
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


-- insert into cif.form(slug, json_schema, description) values ('emission_intensity', '{}', 'test');

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
       ('{"projectId": 1, "reportType": "TEIMP", "reportingRequirementIndex": 1 }'::jsonb,
        'create',
        'cif',
        'reporting_requirement',
        1,
        1,
        'pending',
        'emission_intensity')
       ,
        -- second project with all the data
        (json_build_object(
            'adjustedEmissionsIntensityPerformance', 98,
            'baselineEmissionIntensity', 324.25364,
            'comments', 'comments',
            'dateSentToCsnr', '2023-07-01T23:59:59.999-07:00',
            'emissionFunctionalUnit','tCO2e',
            'measurementPeriodEndDate','2023-07-01T23:59:59.999-07:00',
            'measurementPeriodStartDate', '2023-06-01T23:59:59.999-07:00',
            'postProjectEmissionIntensity', 124.35,
            'productionFunctionalUnit', 'unit',
            'reportDueDate', '2023-06-15T23:59:59.999-07:00',
            'reportType', 'TEIMP',
            'reportingRequirementIndex', 1,
            'submittedDate', '2023-06-30T23:59:59.999-07:00',
            'targetEmissionIntensity', 23.2357,
            'totalLifetimeEmissionReduction', 44.4224
            ),
        'create',
        'cif',
        'reporting_requirement',
        2,
        2,
        'pending',
        'emission_intensity'),
        -- An existing reporting requirement, different from a emission intensity report
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
          '{"reportingRequirementId": 12, "holdbackAmountToDate": 12345 }'::jsonb,
          'create',
          'cif',
          'emission_intensity',
          null,
          null,
          'committed',
          'reporting_requirement');


select cif.commit_project_revision(1);

-- We can't use the cif.create_project_revision() function since it is already updated with the new schema, so we create the form_changes manually.
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
  -- One pending (id=2) for the project_id=2


alter table cif.form_change disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

select cif_private.migration_emission_intensity_report_form_changes_to_single_form_change();

alter table cif.form_change enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;

select is(
  (select count(*) from cif.form_change where (form_data_table_name='emission_intensity_report')),
  0::bigint,
  'There are no form_change records left for the emission_intensity_report table'
);


select is(
  (select count(*) from cif.form_change where form_data_table_name='reporting_requirement' and json_schema_name='emission_intensity'),
  3::bigint,
  'The reporting requirements for emission intensity reports have been converted to the new schema'
);

-- it takes the emission_intensity data from existing revisions and puts them into the new json schema
  -- for committed form changes
  -- for pending form changes
select results_eq(
  $$
    select id, change_status, new_form_data from cif.form_change where form_data_table_name='reporting_requirement' and json_schema_name='emission_intensity' order by id;
  $$,
  $$
--   monkeyfuzz projectId is in here
   values (3, 'committed'::varchar, '{"reportType": "TEIMP", "reportingRequirementIndex": 1}'::jsonb),
          (6, 'pending'::varchar, '{
            "adjustedEmissionsIntensityPerformance": 98,
            "baselineEmissionIntensity": 324.25364,
            "comments": "comments",
            "dateSentToCsnr": "2023-07-01T23:59:59.999-07:00",
            "emissionFunctionalUnit":"tCO2e",
            "measurementPeriodEndDate":"2023-07-01T23:59:59.999-07:00",
            "measurementPeriodStartDate": "2023-06-01T23:59:59.999-07:00",
            "postProjectEmissionIntensity": 124.35,
            "productionFunctionalUnit": "unit",
            "reportDueDate": "2023-06-15T23:59:59.999-07:00",
            "reportType": "TEIMP",
            "reportingRequirementIndex": 1,
            "submittedDate": "2023-06-30T23:59:59.999-07:00",
            "targetEmissionIntensity": 23.2357,
            "totalLifetimeEmissionReduction": 44.4224
          }'::jsonb),
          (12, 'pending'::varchar, '{"reportType": "TEIMP", "reportingRequirementIndex": 1}'::jsonb)

  $$,
  'It transforms the double (reporting_requirement, emission_intensity_report) into one single form_change without nulls'
);

-- it transforms the existing form_change for the reporting_requirement into the new format
select results_eq(
  $$
    select form_data_table_name::text, json_schema_name::text, change_status::text from cif.form_change where id in (3,6,12)
  $$,
  $$
    values ('emission_intensity','reporting_requirement', 'pending'),
           ('emission_intensity','reporting_requirement', 'committed'),
           ('emission_intensity','reporting_requirement', 'pending')
  $$,
  'It transforms the existing reporting_requirement form_change to the emission_intensity schema, and keeps the change_status'
);

-- it doesn't touch the form changes not in a revision
select results_eq(
  $$
    select id, new_form_data from cif.form_change where id=10
  $$,
  $$
    values (10,'{"holdbackAmountToDate": 12345, "reportingRequirementId": 12}'::jsonb)
  $$,
  'It leaves the form_changes without a project revision'
);

-- it doesn't touch other reporting requirement form changes.
select is(
  (select new_form_data from cif.form_change where id=9),
  ('{"projectId": 1, "reportType": "Quarterly", "reportingRequirementIndex": 1}'::jsonb),
  'It doesn''t touch the form changes that are not for the emission intensity report.'
);

-- It is idempotent
-- We re-run the first 3 tests to make sure nothing has changed

alter table cif.form_change disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

select cif_private.migration_milestone_form_changes_to_single_form_change();

alter table cif.form_change enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;



select is(
  (select count(*) from cif.form_change where (form_data_table_name='emission_intensity_report')),
  0::bigint,
  'There are no form_change records left for the emission_intensity_report table'
);


select is(
  (select count(*) from cif.form_change where form_data_table_name='reporting_requirement' and json_schema_name='emission_intensity'),
  3::bigint,
  'The reporting requirements for emission intensity reports have been converted to the new schema'
);

-- it takes the emission_intensity data from existing revisions and puts them into the new json schema
  -- for committed form changes
  -- for pending form changes
select results_eq(
  $$
    select id, change_status, new_form_data from cif.form_change where form_data_table_name='reporting_requirement' and json_schema_name='emission_intensity' order by id;
  $$,
  $$
   values (3, 'committed'::varchar, '{"reportType": "TEIMP", "reportingRequirementIndex": 1}'::jsonb),
          (6, 'pending'::varchar, '{
            "adjustedEmissionsIntensityPerformance": 98,
            "baselineEmissionIntensity": 324.25364,
            "comments": "comments",
            "dateSentToCsnr": "2023-07-01T23:59:59.999-07:00",
            "emissionFunctionalUnit":"tCO2e",
            "measurementPeriodEndDate":"2023-07-01T23:59:59.999-07:00",
            "measurementPeriodStartDate": "2023-06-01T23:59:59.999-07:00",
            "postProjectEmissionIntensity": 124.35,
            "productionFunctionalUnit": "unit",
            "reportDueDate": "2023-06-15T23:59:59.999-07:00",
            "reportType": "TEIMP",
            "reportingRequirementIndex": 1,
            "submittedDate": "2023-06-30T23:59:59.999-07:00",
            "targetEmissionIntensity": 23.2357,
            "totalLifetimeEmissionReduction": 44.4224
          }'::jsonb),
          (12, 'pending'::varchar, '{"reportType": "TEIMP", "reportingRequirementIndex": 1}'::jsonb)

  $$,
  'It transforms the double (reporting_requirement, emission_intensity_report) into one single form_change without nulls'
);




select finish();

rollback;
