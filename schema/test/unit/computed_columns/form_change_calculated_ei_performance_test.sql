begin;

select plan(5);

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
  'emission_intensity',
  '{"baselineEmissionIntensity":1,"targetEmissionIntensity":2,"postProjectEmissionIntensity":3,"totalLifetimeEmissionReduction":4}'
),
(
  2,
  'create',
  'cif',
  'reporting_requirement',
  2,
  1,
  'emission_intensity',
  '{"targetEmissionIntensity":2,"postProjectEmissionIntensity":3,"totalLifetimeEmissionReduction":4}'
),
(
  3,
  'create',
  'cif',
  'reporting_requirement',
  3,
  1,
  'emission_intensity',
  '{"baselineEmissionIntensity":1,"postProjectEmissionIntensity":3,"totalLifetimeEmissionReduction":4}'
),
(
  4,
  'create',
  'cif',
  'reporting_requirement',
  4,
  1,
  'emission_intensity',
  '{"baselineEmissionIntensity":1,"targetEmissionIntensity":2,"totalLifetimeEmissionReduction":3}'
),
(
  5,
  'create',
  'cif',
  'reporting_requirement',
  5,
  1,
  'emission_intensity',
  '{"baselineEmissionIntensity":1,"targetEmissionIntensity":1,"postProjectEmissionIntensity":2}'
);

select is(
  (
    select cif.form_change_calculated_ei_performance((select row(form_change.*)::cif.form_change from cif.form_change where id=1))
  ),
  200.00,
  'Returns the the calculated EI performance when all required values exist'
);

select is(
  (
    select cif.form_change_calculated_ei_performance((select row(form_change.*)::cif.form_change from cif.form_change where id=2))
  ),
  null,
  'Returns null when baseline_emission_intensity is null but all other values exist'
);

select is(
  (
    select cif.form_change_calculated_ei_performance((select row(form_change.*)::cif.form_change from cif.form_change where id=3))
  ),
  null,
  'Returns null when target_emission_intensity is null but all other values exist'
);

select is(
  (
    select cif.form_change_calculated_ei_performance((select row(form_change.*)::cif.form_change from cif.form_change where id=4))
  ),
  null,
  'Returns null when post_project_emission_intensity is null but all other values exist'
);

select is(
  (
    select cif.form_change_calculated_ei_performance((select row(form_change.*)::cif.form_change from cif.form_change where id=5))
  ),
  null,
  'Returns null when baseline_intensity_emission and target_emission_intensity are equal (woud produce division by 0)'
);

select finish();
rollback;
