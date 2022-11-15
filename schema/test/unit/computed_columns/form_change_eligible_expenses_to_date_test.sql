begin;

select plan(3);

/** SETUP **/

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
  '{"reportType": "General Milestone", "hasExpenses": true, "reportDueDate": "2022-11-14 15:09:36.264005-08", "totalEligibleExpenses": 10000, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}'
),
(
  2,
  'create',
  'cif',
  'reporting_requirement',
  2,
  1,
  'milestone',
  '{"reportType": "General Milestone", "hasExpenses": true, "reportDueDate": "2022-11-15 15:09:36.264005-08", "totalEligibleExpenses": 20000, "reportingRequirementIndex": 2, "certifierProfessionalDesignation": "Professional Engineer"}'
),
(
  3,
  'create',
  'cif',
  'reporting_requirement',
  2,
  1,
  'milestone',
  '{"reportType": "General Milestone", "hasExpenses": true, "reportDueDate": "2022-11-16 15:09:36.264005-08", "totalEligibleExpenses": 30000, "reportingRequirementIndex": 3, "certifierProfessionalDesignation": "Professional Engineer"}'
),
(
  4,
  'create',
  'cif',
  'reporting_requirement',
  3,
  1,
  'milestone',
  '{"reportType": "Performance Milestone", "hasExpenses": false, "reportDueDate": "2022-11-10 15:09:36.264005-08", "totalEligibleExpenses": 40000, "reportingRequirementIndex": 4, "certifierProfessionalDesignation": "Professional Engineer"}'
);
/** SETUP END **/


select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=1
    ) select cif.form_change_eligible_expenses_to_date((select * from record))
  ),
  (
    10000::numeric
  ),
  'Returns the correct amount for the first milestone with expenses'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=3
    ) select cif.form_change_eligible_expenses_to_date((select * from record))
  ),
  (
    60000::numeric
  ),
  'Returns the correct cumulative amount for the third milestone with expenses'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=4
    ) select cif.form_change_eligible_expenses_to_date((select * from record))
  ),
  (
    null
  ),
  'Returns null for a milestone where hasExpenses is false'
);

select finish();

rollback;
