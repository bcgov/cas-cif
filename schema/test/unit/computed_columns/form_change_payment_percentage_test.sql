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
  '"emission_intensity_report"',
  1,
  1,
  'milestone',
  '{"adjustedEmissionsIntensityPerformance": "50"}'
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
  'payments percentage is calculated correctly'
);

select finish();

rollback;
