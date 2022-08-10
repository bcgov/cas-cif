

begin;

select plan(8);

-- Setup

truncate cif.project_revision restart identity cascade;
truncate cif.form_change restart identity cascade;

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending');

insert into cif.form_change(id, new_form_data, operation, change_status, form_data_schema_name, form_data_table_name, form_data_record_id, project_revision_id, json_schema_name, validation_errors)
  overriding system value
  values
    -- The containing reporting requirement
    (1,
     format('{"reportDueDate": "%s", "projectId": 1, "reportType": "General Milestone", "reportingRequirementIndex": 1}',
     now() + interval '2 days')::jsonb,
     'create',
     'pending',
     'cif',
     'reporting_requirement',
     1,
     1,
     'reporting_requirement',
     '[]'),
    -- One emission intensity report
    (2,
     format('{"reportingRequirementId": 1, "baselineEmissionIntensity": 30, "postProjectEmissionIntensity": 20, "targetEmissionIntensity": 10}')::jsonb,
     'create',
     'pending',
     'cif',
     'emission_intensity_report',
     null,
     1,
     'emission_intensity_report',
     '[]');

-- returns the right value if performance is integer between 30 and 100
-- ((30-20) / (30-10))*100 = 50%
select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select * from cif.project_revision_teimp_payment_percentage((select * from record))
  ),
  30.0,
  'Should return the right percentage for an integer value between 30 and 100'
);

-- returns the right value if performance is fractional between 30 and 100
-- ((30-19) / (30-15))*100 = 73.33..%
update cif.form_change set new_form_data=new_form_data || '{"baselineEmissionIntensity": 30, "postProjectEmissionIntensity": 19, "targetEmissionIntensity": 15}'
  where id=2;

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select * from cif.project_revision_teimp_payment_percentage((select * from record))
  ),
  66.0,
  'Should round up to the right percentage for a fractional value between 30 and 100'
);

-- returns the right value if performance is below 30
-- ((30-29) / (30-15))*100 = 6.66..%
update cif.form_change set new_form_data=new_form_data || '{"baselineEmissionIntensity": 30, "postProjectEmissionIntensity": 29, "targetEmissionIntensity": 15}'
  where id=2;

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select * from cif.project_revision_teimp_payment_percentage((select * from record))
  ),
  0.0,
  'Should return the right percentage for a value below 30'
);

-- returns the right value if performance is above 100
-- ((30-29) / (30-15))*100 = 6.66..%
update cif.form_change set new_form_data=new_form_data || '{"baselineEmissionIntensity": 30, "postProjectEmissionIntensity": 10, "targetEmissionIntensity": 15}'
  where id=2;

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select * from cif.project_revision_teimp_payment_percentage((select * from record))
  ),
  100.0,
  'Should return the right percentage for a value above 100'
);


-- Doesn't blow up if we divide by zero
update cif.form_change set new_form_data=new_form_data || '{"baselineEmissionIntensity": 30, "postProjectEmissionIntensity": 10, "targetEmissionIntensity": 30}'
  where id=2;

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select * from cif.project_revision_teimp_payment_percentage((select * from record))
  ),
  null,
  'Returns null if calculation divides by zero'
);

-- Doesn't blow up if data is missing
update cif.form_change set new_form_data='{"reportingRequirementId": 1}'
  where id=2;

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select * from cif.project_revision_teimp_payment_percentage((select * from record))
  ),
  null,
  'Returns null if data is missing'
);

-- Uses the adjusted emissions intensity performance if set
-- 43% emissions performance means 20% payment
update cif.form_change set
    new_form_data='{"reportingRequirementId": 1, "baselineEmissionIntensity": 30, "postProjectEmissionIntensity": 20, "targetEmissionIntensity": 10, "adjustedEmissionsIntensityPerformance": 43}'
  where id=2;

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select * from cif.project_revision_teimp_payment_percentage((select * from record))
  ),
  20::numeric,
  'Returns the adjusted teimp payment percentage if set'
);

-- only takes in account non-archiving form_changes (operation not archive)
update cif.form_change set
    operation='archive',
    new_form_data='{"reportingRequirementId": 1, "baselineEmissionIntensity": 30, "postProjectEmissionIntensity": 20, "targetEmissionIntensity": 10}'
  where id=2;

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select * from cif.project_revision_teimp_payment_percentage((select * from record))
  ),
  null,
  'Returns null if the form_change is set to archive'
);




select finish();

rollback;
