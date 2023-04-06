begin;

select plan(5);

/** SETUP **/

truncate cif.project_revision restart identity cascade;

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
  '{"reportType": "General Milestone", "hasExpenses": true, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}'
),
(
  2,
  'create',
  'cif',
  'reporting_requirement',
  2,
  1,
  'milestone',
  '{"reportType": "General Milestone", "hasExpenses": true, "adjustedGrossAmount": 20000, "totalEligibleExpenses": 30000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}'
),
(
  3,
  'create',
  'cif',
  'reporting_requirement',
  3,
  1,
  'milestone',
  '{"reportType": "General Milestone", "hasExpenses": false, "maximumAmount": 12000, "totalEligibleExpenses": 30000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}'
),
(
  4,
  'create',
  'cif',
  'reporting_requirement',
  3,
  1,
  'milestone',
  '{"reportType": "General Milestone", "hasExpenses": true, "adjustedGrossAmount": 20000, "totalEligibleExpenses": 30000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}'
),
(
  5,
  'create',
  'cif',
  'reporting_requirement',
  3,
  1,
  'milestone',
  '{"reportType": "General Milestone", "hasExpenses": true, "maximumAmount": 12000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}'
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
  6,
  'create',
  'cif',
  'funding_parameter',
  1,
  1,
  'funding_parameter_EP',
  '{"projectId": 1, "maxFundingAmount": 1000000, "provinceSharePercentage": 50, "holdbackPercentage": 10}'
);
/** SETUP END **/

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=1
    ) select cif.form_change_calculated_holdback_amount_this_milestone((select * from record))
  ),
  (
    1000.00::numeric
  ),
  'Returns the correct holdback amount from the calculated gross amount when adjustedGrossAmount is not set'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=2
    ) select cif.form_change_calculated_holdback_amount_this_milestone((select * from record))
  ),
  (
    2000.00::numeric
  ),
  'Returns the correct holdback amount from the adjusted gross amount when adjustedGrossAmount is set'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=3
    ) select cif.form_change_calculated_holdback_amount_this_milestone((select * from record))
  ),
  (
    0::numeric
  ),
  'Returns 0 when hasExpenses is false'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=4
    ) select cif.form_change_calculated_holdback_amount_this_milestone((select * from record))
  ),
  (
    null
  ),
  'Returns null when submittedDate not provided'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=5
    ) select cif.form_change_calculated_holdback_amount_this_milestone((select * from record))
  ),
  (
    null
  ),
  'Returns null when milestoneType is General Milestone and totalEligibleExpenses is null'
);

select finish();

rollback;
