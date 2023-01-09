-- brianna tomorrow go look in the db at the various form changes in the form change table to see where you're missing info

begin;

select * from no_plan();

/** SETUP */

truncate cif.project restart identity cascade;

-- create four projects
select cif.create_project(1);
-- select cif.create_project(1);
-- select cif.create_project(1);
-- select cif.create_project(1);

select cif.create_form_change(
        'create',
        'milestone',
        'cif',
        'reporting_requirement',
        json_build_object(
          'projectId', 1,
          'reportDueDate', '2022-03-01 16:21:42.693489-07',
          'submittedDate', '2022-03-01 16:21:42.693489-07',
          'reportType', 'General Milestone',
          'reportingRequirementIndex', 1,
          'description', 'general milestone report description ' ,
          'adjustedGrossAmount', 1,
          'adjustedNetAmount', 1,
          'dateSentToCsnr', '2022-03-01 16:21:42.693489-07',
          'certifierProfessionalDesignation', 'Professional Engineer',
          'substantialCompletionDate', '2022-03-01 16:21:42.693489-07',
          'maximumAmount', 1,
          'totalEligibleExpenses', 1,
          'certifiedBy', 'Elliot Page',
          'hasExpenses', true
        )::jsonb,
        null,
        1
      );
     
select cif.create_form_change(
        'create',
        'funding_agreement',
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

/** END SETUP */

select has_function('cif', 'project_revision_anticipated_funding_amount_per_fiscal_year', 'Function should exist');


select results_eq (
  $$
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select (r).* from cif.project_revision_anticipated_funding_amount_per_fiscal_year((select * from record)) r
  )
   $$,
  $$
    values ('2021/2022'::text, 1::numeric), ('2024/2025'::text, 2000::numeric)
  $$,
  'Function calculates anticipated amount when gross amounts are all calculated'
);

-- brianna also test that it excludes archived milestones, can be separate or part of other test since part of calculation

-- select results_eq (
--   $$
--   (
--     with record as (
--       select row(project_revision.*)::cif.project_revision
--       from cif.project_revision where id=2
--     ) 
--     select (r).* from cif.project_revision_anticipated_funding_amount_per_fiscal_year((select * from record)) r
--   )
--    $$,
--   $$
--     values (('2021/2022', 400)::cif.sum_by_fiscal_year), (('2022/2023', 1000)::cif.sum_by_fiscal_year)
--   $$,
--   'Function calculates anticipated amount when some gross amounts have been adjusted'
-- );

-- select results_eq (
--   $$
--   (
--     with record as (
--       select row(project_revision.*)::cif.project_revision
--       from cif.project_revision where id=3
--     ) select anticipated_funding_amount from cif.project_revision_anticipated_funding_amount_per_fiscal_year((select * from record))
--   )
--   $$,
--   $$
--     values ('2024/2025'::text, 3000::numeric)
--   $$,
--   'Function calculates anticipated amount when gross amount is not available (uses maximum amounts)'
-- );


-- select lives_ok (
--   $$
--     with record as (
--       select row(project_revision.*)::cif.project_revision
--       from cif.project_revision where id=4
--     ) select anticipated_funding_amount from cif.project_revision_anticipated_funding_amount_per_fiscal_year((select * from record))
--   $$,
--   'Function does not break when passed null amounts'
-- );


select finish();

rollback;
