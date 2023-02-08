
begin;

select * from no_plan();

/** SETUP **/

truncate cif.project_revision restart identity cascade;

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
  'funding_parameter',
  '{"projectId": 1, "maxFundingAmount": 1000000, "provinceSharePercentage": 50, "holdbackPercentage": 10}'
);

/** END SETUP **/

-- It returns the updated record with the proper calculated value for gross amount
select is(
  (
    select
      (new_form_data->>'calculatedGrossAmount')::numeric
    from cif.update_milestone_form_change(
      1, (select row( null, '{"reportType": "General Milestone", "hasExpenses": true, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}', null, null, null, null, null, null, null, null, null, null, null, null, null, null)::cif.form_change)
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
      1, (select row( null, '{"reportType": "General Milestone", "hasExpenses": true, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}', null, null, null, null, null, null, null, null, null, null, null, null, null, null)::cif.form_change)
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
      1, (select row( null, '{"reportType": "General Milestone", "hasExpenses": true, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}', null, null, null, null, null, null, null, null, null, null, null, null, null, null)::cif.form_change)
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
      1, (select row( null, '{"reportType": "General Milestone", "hasExpenses": true, "adjustedGrossAmount": 500, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}', null, null, null, null, null, null, null, null, null, null, null, null, null, null)::cif.form_change)
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
      1, (select row( null, '{"reportType": "General Milestone", "hasExpenses": true, "adjustedGrossAmount": 500, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}', null, null, null, null, null, null, null, null, null, null, null, null, null, null)::cif.form_change)
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
      1, (select row( null, '{"reportType": "General Milestone", "hasExpenses": true, "adjustedGrossAmount": 500, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}', null, null, null, null, null, null, null, null, null, null, null, null, null, null)::cif.form_change)
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
      1, (select row( null, '{"reportType": "General Milestone", "hasExpenses": false, "maximumAmount": 15000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}', null, null, null, null, null, null, null, null, null, null, null, null, null, null)::cif.form_change)
    )
  ),
  false,
  'The update_mutation_form_change custom mutation properly updates data other than calculated values'
);

select finish();

rollback;
