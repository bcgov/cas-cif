begin;

select * from plan(4);

/** SETUP */

truncate cif.project restart identity cascade;

-- create three projects
select cif.create_project(1); -- this creates project 1 with form_change.id=1
select cif.create_project(1); -- this creates project 2 with form_change.id=2
select cif.create_project(1); -- this creates project 3 with form_change.id=3

-- project 1, milestone 1, 2021/2022 (date sent to csnr), calculated gross
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
          'adjustedNetAmount', 1,
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

select cif.create_form_change(
        'create',
        'funding_parameter_EP',
        'cif',
        'funding_parameter',
        json_build_object(
            'projectId', 1,
            'provinceSharePercentage', 50,
            'holdbackPercentage', 10,
            'maxFundingAmount', 1,
            'anticipatedFundingAmount', 1,
            'proponentCost',777,
            'contractStartDate', '2022-03-01 16:21:42.693489-07',
            'projectAssetsLifeEndDate', '2022-03-01 16:21:42.693489-07'
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
          'adjustedGrossAmount', 2000,
          'adjustedNetAmount', 1,
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

-- project 1, milestone 3, 2024/2025 (submittedDate), adjusted gross
select cif.create_form_change(
        'update',
        'milestone',
        'cif',
        'reporting_requirement',
        json_build_object(
          'projectId', 1,
          'reportDueDate', '2000-12-12 16:21:42.693489-07',
          'submittedDate', '2024-03-01 16:21:42.693489-07',
          'reportType', 'General Milestone',
          'reportingRequirementIndex', 2,
          'description', 'general milestone report description ' ,
          'adjustedGrossAmount', 3000,
          'adjustedNetAmount', 1,
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

-- project 1, milestone 4, 2024/2025 (dateSentToCsnr), archived
select cif.create_form_change(
        'archive',
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
          'adjustedGrossAmount', 4444,
          'adjustedNetAmount', 1,
          'dateSentToCsnr', '2025-03-01 16:21:42.693489-07',
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

-- project 2, milestone 1, 2021/2022 (due date)
select cif.create_form_change(
        'create',
        'milestone',
        'cif',
        'reporting_requirement',
        json_build_object(
          'projectId', 1,
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

-- project 2, milestone 2, 2023/2024 (date sent to csnr)
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
          'dateSentToCsnr', '2024-03-01 16:21:42.693489-07',
          'certifierProfessionalDesignation', 'Professional Engineer',
          'substantialCompletionDate', '2000-12-12 16:21:42.693489-07',
          'maximumAmount', 2200,
          'totalEligibleExpenses', 1,
          'certifiedBy', 'Elliot Page',
          'hasExpenses', true
        )::jsonb,
        null,
        2
      );

-- project 3, milestone 1, null
select cif.create_form_change(
        'create',
        'milestone',
        'cif',
        'reporting_requirement',
        '{}'::jsonb,
        null,
        3
      );

select cif.create_form_change(
        'create',
        'funding_parameter_EP',
        'cif',
        'funding_parameter',
        '{}'::jsonb,
        null,
        3
      );


/** END SETUP */

select has_function('cif', 'form_change_anticipated_funding_amount_per_fiscal_year', 'Function should exist');


select results_eq (
  $$
  (
    with record as (
      select row(form_change.*)::cif.form_change
      from cif.form_change where id=1
    ) select (r).* from cif.form_change_anticipated_funding_amount_per_fiscal_year((select * from record)) r
  )
   $$,
  $$
    values ('2021/2022'::text, 2500::numeric), ('2023/2024'::text, 3000::numeric)
  $$,
  'Function returns correct fiscal years, calculates anticipated amount when gross amounts (both calculated and adjusted) are given, and ignores archived records.'
);

select results_eq (
   $$
  (
    with record as (
      select row(form_change.*)::cif.form_change
      from cif.form_change where id=2
    ) select (r).* from cif.form_change_anticipated_funding_amount_per_fiscal_year((select * from record)) r
  )
   $$,
  $$
    values ('2021/2022'::text, 2100::numeric), ('2023/2024'::text, 2200::numeric)
  $$,
  'Function returns correct fiscal years and calculates anticipated amount when gross amount is not available (uses maximum amounts).'
);


select lives_ok (
  $$
    with record as (
      select row(form_change.*)::cif.form_change
      from cif.form_change where id=3
    ) select anticipated_funding_amount from cif.form_change_anticipated_funding_amount_per_fiscal_year((select * from record))
  $$,
  'Function does not break when passed null amounts.'
);


select finish();

rollback;
