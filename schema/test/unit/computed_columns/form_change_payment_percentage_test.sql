begin;

select plan(3);

/** SETUP **/

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending'),(2, 'pending');

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
  '"emission_intensity_report"',
  1,
  1,
  'milestone',
  '{"adjustedEmissionsIntensityPerformance": "50"}'
),
(
  2,
  'create',
  'cif',
  '"emission_intensity_report"',
  1,
  1,
  'milestone',
  '{"Other": "100"}'
),(
  3,
  'create',
  'cif',
  '"emission_intensity_report"',
  1,
  1,
  'milestone',
  '{
    "form_change_calculated_ei_performance": "1",
    "postProjectEmissionIntensity": "3",
    "targetEmissionIntensity": "4"
    }'
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
  'payments percentage is 30 from the formula: 100 - ((-1.5) x 50 + 145) = 30'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=2
    ) select cif.form_change_payment_percentage((select * from record))
  ),
  (
    null
  ),
  'should return null if the form change does not have adjustedEmissionsIntensityPerformance'
);

select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=3
    ) select cif.form_change_payment_percentage((select * from record))
  ),
  (
    null
  ),
  'should return 200 if the form change does not have adjustedEmissionsIntensityPerformance and has all information to calculate ei performance'
);

-- 200.00,
select finish();

rollback;
