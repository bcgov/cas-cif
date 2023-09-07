begin;

select plan(3);

/** SETUP **/

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending');

insert into cif.project_revision(id, change_status)
  overriding system value
  values (2, 'pending');

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
  '{"reportType": "General Milestone", "hasExpenses": true, "reportDueDate": "2022-11-14 15:09:36.264005-08", "calculatedHoldbackAmount": 10000, "adjustedHoldbackAmount": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}'
),
(
  2,
  'create',
  'cif',
  'reporting_requirement',
  2,
  1,
  'milestone',
  '{"reportType": "General Milestone", "hasExpenses": true, "reportDueDate": "2022-11-15 15:09:36.264005-08", "adjustedHoldbackAmount": 30000, "calculatedHoldbackAmount": 20000, "reportingRequirementIndex": 2, "certifierProfessionalDesignation": "Professional Engineer"}'
),
(
  3,
  'create',
  'cif',
  'reporting_requirement',
  3,
  1,
  'milestone',
  '{"reportType": "General Milestone", "hasExpenses": true, "reportDueDate": "2022-11-14 15:09:36.264005-08", "calculatedHoldbackAmount": 10000, "adjustedHoldbackAmount": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}'
);
/** SETUP END **/


select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=3
    ) select cif.form_change_holdback_amount_to_date((select * from record))
  ),
  (
    70000::numeric
  ),
  'Returns the correct sum of all milestones with expenses'
);


-- adjustedHoldbackAmount or calculatedHoldbackAmount are NULL
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
  'reporting_requirement',
  4,
  2,
  'milestone',
  '{"reportType": "General Milestone", "hasExpenses": true, "reportDueDate": "2022-11-14 15:09:36.264005-08", "adjustedHoldbackAmount": 20000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}'
),
(
  5,
  'create',
  'cif',
  'reporting_requirement',
  5,
  2,
  'milestone',
  '{"reportType": "General Milestone", "hasExpenses": true, "reportDueDate": "2022-11-14 15:09:36.264005-08", "calculatedHoldbackAmount": 10000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}'
);
select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=4
    ) select cif.form_change_holdback_amount_to_date((select * from record))
  ),
  (
  30000::numeric
  ),
  'Returns the correct value when adjustedHoldbackAmount or calculatedHoldbackAmount exists'
);

-- adjustedHoldbackAmount and calculatedHoldbackAmount are NULL
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
  'reporting_requirement',
  5,
  1,
  'milestone',
  '{"reportType": "General Milestone", "hasExpenses": true, "reportDueDate": "2022-11-17 15:09:36.264005-08", "adjustedHoldbackAmount": null, "calculatedHoldbackAmount": null, "reportingRequirementIndex": 6, "certifierProfessionalDesignation": "Professional Engineer"}'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=7
    ) select cif.form_change_holdback_amount_to_date((select * from record))
  ),
  (
    null
  ),
  'Returns null when both adjustedHoldbackAmount and calculatedHoldbackAmount are NULL'
);


rollback;
