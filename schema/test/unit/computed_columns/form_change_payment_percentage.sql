begin;

select plan(1);

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
  '{"reportType": "General Milestone", "hasExpenses": true, "reportDueDate": "2022-11-14 15:09:36.264005-08", "adjustedEmissionsIntensityPerformance": 50, "reportingRequirementIndex": 1, "certifierProfessionalDesignation": "Professional Engineer"}'
);
/** SETUP END **/


select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=1
    ) select cif.form_change_payment_percentage((select * from record))
  ),
  (
    30::numeric
  ),
  'Returns the correct amount for payment percentage'
);

select finish();

rollback;
