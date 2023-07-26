
begin;

select plan(20);

/** SETUP **/

truncate cif.project_revision, cif.operator restart identity cascade;

insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD');

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
overriding system value
values (1, 1, 1, 1, '000', 'summary', 'project 1');

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending');

insert into cif.form_change(
  id,
  operation,
  form_data_schema_name,
  form_data_table_name,
  form_data_record_id,
  project_revision_id,
  json_schema_name,
  new_form_data
) overriding system value
values (
  1,
  'create',
  'cif',
  'reporting_requirement',
  1,
  1,
  'milestone',
  '{"reportType": "General Milestone", "hasExpenses": true, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}'
);

insert into cif.form_change(
  id,
  operation,
  form_data_schema_name,
  form_data_table_name,
  form_data_record_id,
  project_revision_id,
  json_schema_name,
  new_form_data
) overriding system value
values (
  4,
  'create',
  'cif',
  'funding_parameter',
  1,
  1,
  'funding_parameter_EP',
  '{"projectId": 1, "maxFundingAmount": 1000000, "provinceSharePercentage": 50, "holdbackPercentage": 10}'
);

/** END SETUP **/

-- It returns the updated record with the proper calculated value for gross amount
select is(
  (
    select
      (new_form_data->>'calculatedGrossAmount')::numeric
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "General Milestone", "hasExpenses": true, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  10000.00,
  'The update_mutation_form_change custom mutation returns the updated record with the proper calculatedGrossAmount in the form data'
);

-- It returns the updated record with the proper calculated value for gross amount
select is(
  (
    select
      (new_form_data->>'calculatedNetAmount')::numeric
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "General Milestone", "hasExpenses": true, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  9000.00,
  'The update_mutation_form_change custom mutation returns the updated record with the proper calculatedNetAmount in the form data'
);

-- It returns the updated record with the proper calculated value for holdback amount
select is(
  (
    select
      (new_form_data->>'calculatedHoldbackAmount')::numeric
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "General Milestone", "hasExpenses": true, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  1000.00,
  'The update_mutation_form_change custom mutation returns the updated record with the proper calculatedHoldbackAmount in the form data'
);

-- It returns the updated record with the proper adjusted value for gross amount
select is(
  (
    select
      (new_form_data->>'adjustedGrossAmount')::numeric
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "General Milestone", "hasExpenses": true, "adjustedGrossAmount": 500, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  500.00,
  'The update_mutation_form_change custom mutation returns the updated record with the proper adjustedCalculatedAmount in the form data'
);

-- It returns the updated record with the proper calculated value for net amount when gross amount is adjusted
select is(
  (
    select
      (new_form_data->>'calculatedNetAmount')::numeric
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "General Milestone", "hasExpenses": true, "adjustedGrossAmount": 500, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  450.00,
  'The update_mutation_form_change custom mutation returns the updated record with the proper calculated value for net amount when gross amount is adjusted in the form data'
);

-- It returns the updated record with the proper calculated value for holdback amount when gross amount is adjusted
select is(
  (
    select
      (new_form_data->>'calculatedHoldbackAmount')::numeric
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "General Milestone", "hasExpenses": true, "adjustedGrossAmount": 500, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  50.00,
  'The update_mutation_form_change custom mutation returns the updated record with the proper calculated value for holdback amount when gross amount is adjusted in the form data'
);

-- It properly updates form data other than calculated values
select is(
  (
    select
      (new_form_data->>'hasExpenses')::boolean
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "General Milestone", "hasExpenses": false, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  false,
  'The update_mutation_form_change custom mutation properly updates data other than calculated values'
);

-- It makes the total eligible expenses null when report type is not general milestone
select is(
  (
    select
      (new_form_data->>'totalEligibleExpenses')::numeric
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "Advanced Milestone", "hasExpenses": true, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  null,
  'The update_mutation_form_change custom mutation makes the total eligible expenses null when report type is not general milestone'
);

-- It populates the total eligible expenses with the correct value when report type is general milestone
select is(
  (
    select
      (new_form_data->>'totalEligibleExpenses')::numeric
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "General Milestone", "hasExpenses": true, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  20000.00,
  'The update_mutation_form_change custom mutation populates the total eligible expenses with the correct value when report type is general milestone'
);

-- It updates the total eligible expenses with the correct value when updating the total eligible expenses field
select is(
  (
    select
      (new_form_data->>'totalEligibleExpenses')::numeric
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "General Milestone", "hasExpenses": true, "maximumAmount": 15000, "totalEligibleExpenses": 10000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  10000.00,
  'The update_mutation_form_change custom mutation updates the total eligible expenses with the correct value when updating the total eligible expenses field'
);

-- It returns the updated record with the proper calculated value for gross amount
select is(
  (
    select
      (new_form_data->>'calculatedGrossAmount')::numeric
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "Interim Summary Report", "hasExpenses": true, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  10000.00,
  'The update_mutation_form_change custom mutation returns the updated record with the proper calculatedGrossAmount in the form data'
);

-- It returns the updated record with the proper calculated value for gross amount
select is(
  (
    select
      (new_form_data->>'calculatedNetAmount')::numeric
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "Interim Summary Report", "hasExpenses": true, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  9000.00,
  'The update_mutation_form_change custom mutation returns the updated record with the proper calculatedNetAmount in the form data'
);

-- It returns the updated record with the proper calculated value for holdback amount
select is(
  (
    select
      (new_form_data->>'calculatedHoldbackAmount')::numeric
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "Interim Summary Report", "hasExpenses": true, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  1000.00,
  'The update_mutation_form_change custom mutation returns the updated record with the proper calculatedHoldbackAmount in the form data'
);

-- It returns the updated record with the proper adjusted value for gross amount
select is(
  (
    select
      (new_form_data->>'adjustedGrossAmount')::numeric
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "Interim Summary Report", "hasExpenses": true, "adjustedGrossAmount": 500, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  500.00,
  'The update_mutation_form_change custom mutation returns the updated record with the proper adjustedCalculatedAmount in the form data'
);

-- It returns the updated record with the proper calculated value for net amount when gross amount is adjusted
select is(
  (
    select
      (new_form_data->>'calculatedNetAmount')::numeric
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "Interim Summary Report", "hasExpenses": true, "adjustedGrossAmount": 500, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  450.00,
  'The update_mutation_form_change custom mutation returns the updated record with the proper calculated value for net amount when gross amount is adjusted in the form data'
);

-- It returns the updated record with the proper calculated value for holdback amount when gross amount is adjusted
select is(
  (
    select
      (new_form_data->>'calculatedHoldbackAmount')::numeric
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "Interim Summary Report", "hasExpenses": true, "adjustedGrossAmount": 500, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  50.00,
  'The update_mutation_form_change custom mutation returns the updated record with the proper calculated value for holdback amount when gross amount is adjusted in the form data'
);

-- It properly updates form data other than calculated values
select is(
  (
    select
      (new_form_data->>'hasExpenses')::boolean
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "Interim Summary Report", "hasExpenses": false, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  false,
  'The update_mutation_form_change custom mutation properly updates data other than calculated values'
);

-- It populates the total eligible expenses with the correct value when report type is Interim Summary Report
select is(
  (
    select
      (new_form_data->>'totalEligibleExpenses')::numeric
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "Interim Summary Report", "hasExpenses": true, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  20000.00,
  'The update_mutation_form_change custom mutation populates the total eligible expenses with the correct value when report type is Interim Summary Report'
);

-- It updates the total eligible expenses with the correct value when updating the total eligible expenses field
select is(
  (
    select
      (new_form_data->>'totalEligibleExpenses')::numeric
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "Interim Summary Report", "hasExpenses": true, "maximumAmount": 15000, "totalEligibleExpenses": 10000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    )
  ),
  10000.00,
  'The update_mutation_form_change custom mutation updates the total eligible expenses with the correct value when updating the total eligible expenses field'
);

-- It removes calculated values and payment table related fields from new_form_data if report type is not eligible for expenses
insert into cif.form_change(
  id,
  operation,
  form_data_schema_name,
  form_data_table_name,
  form_data_record_id,
  project_revision_id,
  json_schema_name,
  new_form_data
) overriding system value
values (
  2,
  'create',
  'cif',
  'reporting_requirement',
  1,
  1,
  'milestone',
  '{"reportType": "General Milestone", "hasExpenses": true, "maximumAmount": 25000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "adjustedGrossAmount": 10000, "adjustedNetAmount": 9000, "adjustedHoldbackAmount": 1000, "calculatedGrossAmount": 20000, "calculatedNetAmount": 18000, "calculatedHoldbackAmount": 2000, "dateSentToCsnr": "2023-07-01T00:00:00+00:00"}'
);
select results_eq(
  $$
    select
      new_form_data
    from cif.update_milestone_form_change(
      2, (select row( null, '{"reportType": "Reporting Milestone", "hasExpenses": false, "maximumAmount": 25000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "adjustedGrossAmount": 10000, "adjustedNetAmount": 9000, "adjustedHoldbackAmount": 1000, "calculatedGrossAmount": 20000, "calculatedNetAmount": 18000, "calculatedHoldbackAmount": 2000}', 'create', 'cif', 'reporting_requirement', 1, 1, 'pending', 'milestone', '[]', null, null, null, null, null)::cif.form_change)
    );
  $$,
  $$
    values (
      '{"reportType": "Reporting Milestone", "hasExpenses": false, "reportingRequirementIndex": 1}'::jsonb
    )
  $$,
  'The update_form_change custom mutation removes calculated values and payment table related fields from new_form_data if report type is not eligible for expenses'
);

select finish();

rollback;
