begin;

select plan(5);

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
  '"emission_intensity"',
  1,
  1,
  'milestone',
  '{"adjustedEmissionsIntensityPerformance": "50"}'
),
(
  2,
  'create',
  'cif',
  '"emission_intensity"',
  1,
  1,
  'milestone',
  '{"Other": "100"}'
),(
  3,
  'create',
  'cif',
  '"emission_intensity"',
  1,
  1,
  'milestone',
  '{
    "form_change_calculated_ei_performance": "1",
    "postProjectEmissionIntensity": "3",
    "targetEmissionIntensity": "4"
    }'
),(
  4,
  'create',
  'cif',
  '"emission_intensity"',
  1,
  1,
  'milestone',
  '{"adjustedEmissionsIntensityPerformance": "500"}'
),(
  5,
  'create',
  'cif',
  '"emission_intensity"',
  1,
  1,
  'milestone',
  '{"adjustedEmissionsIntensityPerformance": "-800"}'
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
  'payments percentage is 30 from the formula: 100 – ((-1.5) x GHG Emission Intensity Performance + 145), values capped at 0 and 100'
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

-- should return 100 if payment percentage is very large (over 100%)
select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=4
    ) select cif.form_change_payment_percentage((select * from record))
  ),
  (
    100::numeric
  ),
  'payments percentage is 100 from the formula: 100 – ((-1.5) x GHG Emission Intensity Performance + 145), values capped at 0 and 100'
);

-- should return 0 if payment percentage is negative
select is(
  (
    with record as (
    select row(form_change.*)::cif.form_change
    from cif.form_change where id=5
    ) select cif.form_change_payment_percentage((select * from record))
  ),
  (
    0::numeric
  ),
  'payments percentage is 0 from the formula: 100 – ((-1.5) x GHG Emission Intensity Performance + 145), values capped at 0 and 100'
);

-- 200.00,
select finish();

rollback;
