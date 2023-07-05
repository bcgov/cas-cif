begin;
select plan(11);


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
  '{"reportType": "General Milestone", "hasExpenses": true, "adjustedGrossAmount": 12000, "totalEligibleExpenses": 30000, "reportingRequirementIndex": 2, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}'
),
(
  3,
  'create',
  'cif',
  'reporting_requirement',
  2,
  1,
  'milestone',
  '{"reportType": "General Milestone", "hasExpenses": true, "adjustedHoldbackAmount": 2000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 3, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}'
),
(
  4,
  'create',
  'cif',
  'reporting_requirement',
  3,
  1,
  'milestone',
  '{"reportType": "General Milestone", "hasExpenses": false, "maximumAmount": 12000, "totalEligibleExpenses": 30000, "reportingRequirementIndex": 4, "certifierProfessionalDesignation": "Professional Engineer"}'
),
(
  5,
  'create',
  'cif',
  'reporting_requirement',
  4,
  1,
  'milestone',
  '{"reportType": "General Milestone", "hasExpenses": true, "maximumAmount": 12000, "totalEligibleExpenses": 30000, "reportingRequirementIndex": 5, "certifierProfessionalDesignation": "Professional Engineer"}'
),
(
  6,
  'create',
  'cif',
  'reporting_requirement',
  5,
  1,
  'milestone',
  '{"reportType": "General Milestone", "hasExpenses": true, "maximumAmount": 12000, "reportingRequirementIndex": 6, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}'
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
  7,
  'create',
  'cif',
  'funding_parameter',
  1,
  1,
  'funding_parameter_EP',
  '{"projectId": 1, "maxFundingAmount": 1000000, "provinceSharePercentage": 50, "holdbackPercentage": 10}'
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
values
  -- Interim Summary Report with adjustedGrossAmount and adjustedHoldbackAmount not set
  (
    8,
    'create',
    'cif',
    'reporting_requirement',
    1,
    1,
    'milestone',
    '{"reportType": "Interim Summary Report", "hasExpenses": true, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}'
  ),
  -- Interim Summary Report with adjustedGrossAmount set
  (
    9,
    'create',
    'cif',
    'reporting_requirement',
    2,
    1,
    'milestone',
    '{"reportType": "Interim Summary Report", "hasExpenses": true, "adjustedGrossAmount": 12000, "totalEligibleExpenses": 30000, "reportingRequirementIndex": 2, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}'
  ),
  -- Interim Summary Report with adjustedHoldbackAmount set
  (
    10,
    'create',
    'cif',
    'reporting_requirement',
    3,
    1,
    'milestone',
    '{"reportType": "Interim Summary Report", "hasExpenses": true, "adjustedHoldbackAmount": 2000, "totalEligibleExpenses": 20000, "reportingRequirementIndex": 3, "certifierProfessionalDesignation": "Professional Engineer", "submittedDate":"2002-02-20T12:00:01-07"}'
  ),
  -- Interim Summary Report with hasExpenses set to false
  (
    11,
    'create',
    'cif',
    'reporting_requirement',
    4,
    1,
    'milestone',
    '{"reportType": "Interim Summary Report", "hasExpenses": false, "maximumAmount": 12000, "totalEligibleExpenses": 30000, "reportingRequirementIndex": 4, "certifierProfessionalDesignation": "Professional Engineer"}'
  ),
  -- Interim Summary Report with submittedDate not provided
  (
    12,
    'create',
    'cif',
    'reporting_requirement',
    5,
    1,
    'milestone',
    '{"reportType": "Interim Summary Report", "hasExpenses": true, "maximumAmount": 12000, "totalEligibleExpenses": 30000, "reportingRequirementIndex": 5, "certifierProfessionalDesignation": "Professional Engineer"}'
  );
/** SETUP END **/


select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=1
    ) select cif.form_change_calculated_net_amount_this_milestone((select * from record))
  ),
  (
    9000.00::numeric
  ),
  'Returns the correct calculated amount when adjustedGrossAmount and adjustedHoldbackAmount are not set'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=2
    ) select cif.form_change_calculated_net_amount_this_milestone((select * from record))
  ),
  (
    10800.00::numeric
  ),
  'Returns the correct calculated amount when adjustedGrossAmount is set'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=3
    ) select cif.form_change_calculated_net_amount_this_milestone((select * from record))
  ),
  (
    8000.00::numeric
  ),
  'Returns the correct calculated amount when adjustedHoldbackAmount is set'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=4
    ) select cif.form_change_calculated_net_amount_this_milestone((select * from record))
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
    from cif.form_change where id=5
    ) select cif.form_change_calculated_net_amount_this_milestone((select * from record))
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
    from cif.form_change where id=6
    ) select cif.form_change_calculated_net_amount_this_milestone((select * from record))
  ),
  (
    null
  ),
  'Returns null when milestoneType is General Milestone and totalEligibleExpenses is null'
);


select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=8
    ) select cif.form_change_calculated_net_amount_this_milestone((select * from record))
  ),
  (
    9000.00::numeric
  ),
  'Returns the correct calculated amount for Interim Summary Report when adjustedGrossAmount and adjustedHoldbackAmount are not set'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=9
    ) select cif.form_change_calculated_net_amount_this_milestone((select * from record))
  ),
  (
    10800.00::numeric
  ),
  'Returns the correct calculated amount for Interim Summary Report when adjustedGrossAmount is set'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=10
    ) select cif.form_change_calculated_net_amount_this_milestone((select * from record))
  ),
  (
    8000.00::numeric
  ),
  'Returns the correct calculated amount for Interim Summary Report when adjustedHoldbackAmount is set'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=11
    ) select cif.form_change_calculated_net_amount_this_milestone((select * from record))
  ),
  (
    0::numeric
  ),
  'Returns 0 for Interim Summary Report when hasExpenses is false'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=12
    ) select cif.form_change_calculated_net_amount_this_milestone((select * from record))
  ),
  (
    null
  ),
  'Returns null for Interim Summary Report when submittedDate not provided'
);


select finish();

rollback;
