begin;

select * from plan(4);

/** SETUP */

truncate cif.project restart identity cascade;

-- create three projects
select cif.create_project(1); -- this creates project 1 with form_change.id=1
select cif.create_project(1); -- this creates project 2 with form_change.id=2

-- project 1, milestone 1
select cif.create_form_change(
        'create',
        'milestone',
        'cif',
        'reporting_requirement',
        json_build_object(
          'projectId', 1,
          'reportDueDate', '2000-12-12 16:21:42.693489-07',
          'submittedDate', '2000-12-12 16:21:42.693489-07',
          'reportType', 'General Milestone',
          'reportingRequirementIndex', 1,
          'description', 'general milestone report description ' ,
          'adjustedNetAmount', 4,
          'adjustedGrossAmount', 5,
          'adjustedHoldBackAmount', 1,
          'dateSentToCsnr', '2022-03-01 16:21:42.693489-07',
          'certifierProfessionalDesignation', 'Professional Engineer',
          'substantialCompletionDate', '2000-12-12 16:21:42.693489-07',
          'maximumAmount', 555,
          'totalEligibleExpenses', 1000,
          'certifiedBy', 'Elliot Page',
          'hasExpenses', true
        )::jsonb,
        null,
        1
      );

-- project 1, milestone 2, 2021/2022 (date sent to csnr), adjusted gross
select cif.create_form_change(
        'create',
        'milestone',
        'cif',
        'reporting_requirement',
        json_build_object(
          'projectId', 1,
          'reportDueDate', '2000-12-12 16:21:42.693489-07',
          'submittedDate', '2000-12-12 16:21:42.693489-07',
          'reportType', 'General Milestone',
          'reportingRequirementIndex', 2,
          'description', 'general milestone report description ' ,
          'adjustedGrossAmount', 10,
          'adjustedNetAmount', 9,
          'adjustedHoldBackAmount', 1,
          'dateSentToCsnr', '2022-03-01 16:21:42.693489-07',
          'certifierProfessionalDesignation', 'Professional Engineer',
          'substantialCompletionDate', '2000-12-12 16:21:42.693489-07',
          'maximumAmount', 1,
          'totalEligibleExpenses', 1,
          'certifiedBy', 'Elliot Page',
          'hasExpenses', true
        )::jsonb,
        null,
        1
      );

-- project 2, milestone 1, unaffected
select cif.create_form_change(
        'create',
        'milestone',
        'cif',
        'reporting_requirement',
        json_build_object(
          'projectId', 2,
          'reportDueDate', '2022-03-01 16:21:42.693489-07',
          'reportType', 'General Milestone',
          'reportingRequirementIndex', 1,
          'description', 'general milestone report description ' ,
          'adjustedNetAmount', 1,
          'certifierProfessionalDesignation', 'Professional Engineer',
          'substantialCompletionDate', '2000-12-12 16:21:42.693489-07',
          'maximumAmount', 2100,
          'certifiedBy', 'Elliot Page',
          'hasExpenses', true
        )::jsonb,
        null,
        2
      );

/** END SETUP */

update cif.form_change
  set new_form_data = replace(new_form_data::text, 'adjustedHoldBackAmount', 'adjustedHoldbackAmount')::jsonb
  where json_schema_name='milestone'
  and (new_form_data->>'adjustedHoldBackAmount') is not null;

select is (
  (
    select count(*) from cif.form_change where (new_form_data ->>'adjustedHoldBackAmount') is not null
  ),
  (
    0::bigint
  ),
  'There are no records with the bad capitalization after the migration'
);

select is (
  (
    select count(*) from cif.form_change where (new_form_data ->>'adjustedHoldbackAmount') is not null
  ),
  (
    2::bigint
  ),
  'There are two records with the correct capitalization after the migration'
);

select is (
  (
    select new_form_data from cif.form_change where json_schema_name = 'milestone' order by id limit 1
  ),
  (
    select json_build_object(
          'projectId', 1,
          'reportDueDate', '2000-12-12 16:21:42.693489-07',
          'submittedDate', '2000-12-12 16:21:42.693489-07',
          'reportType', 'General Milestone',
          'reportingRequirementIndex', 1,
          'description', 'general milestone report description ' ,
          'adjustedNetAmount', 4,
          'adjustedGrossAmount', 5,
          'adjustedHoldbackAmount', 1,
          'dateSentToCsnr', '2022-03-01 16:21:42.693489-07',
          'certifierProfessionalDesignation', 'Professional Engineer',
          'substantialCompletionDate', '2000-12-12 16:21:42.693489-07',
          'maximumAmount', 555,
          'totalEligibleExpenses', 1000,
          'certifiedBy', 'Elliot Page',
          'hasExpenses', true
        )::jsonb
  ),
  'The rest of the form_change data for project 1 milestone 1 was unchanged'
);

select is (
  (
    select new_form_data from cif.form_change where json_schema_name = 'milestone' order by id desc limit 1
  ),
  (
    json_build_object(
          'projectId', 2,
          'reportDueDate', '2022-03-01 16:21:42.693489-07',
          'reportType', 'General Milestone',
          'reportingRequirementIndex', 1,
          'description', 'general milestone report description ' ,
          'adjustedNetAmount', 1,
          'certifierProfessionalDesignation', 'Professional Engineer',
          'substantialCompletionDate', '2000-12-12 16:21:42.693489-07',
          'maximumAmount', 2100,
          'certifiedBy', 'Elliot Page',
          'hasExpenses', true
        )::jsonb
  ),
  'The form_change data for project 2 milestone 1 was not affected as it did not have the incorrectly capitalized key'
);

select finish();

rollback;
