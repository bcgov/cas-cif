begin;

select plan(6);

/** SETUP **/
truncate table cif.form_change,
  cif.project_revision,
  cif.project,
  cif.project_contact,
  cif.contact,
  cif.project_manager,
  cif.operator,
  cif.attachment,
  cif.emission_intensity_report,
  cif.milestone_report,
  cif.reporting_requirement,
  cif.payment,
  cif.funding_parameter,
  cif.additional_funding_source,
  cif.project_revision_amendment_type,
  cif.project_attachment
restart identity;

insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD');

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
overriding system value
values (1, 1, 1, 1, '000', 'summary', 'project 1');

insert into cif.project_revision(id, change_status, project_id)
  overriding system value
  values (1, 'pending', 1);


select cif.create_form_change('create', 'emission_intensity', 'cif', 'reporting_requirement', '{}', 7, null, 'staged', '[]');
select cif.create_form_change('update', 'emission_intensity', 'cif', 'reporting_requirement', '{"description": "value"}', null, null, 'committed', '[]');
select cif.create_form_change('create', 'emission_intensity', 'cif', 'reporting_requirement',
  '{
    "adjustedEmissionsIntensityPerformance": 98,
    "baselineEmissionIntensity": 324.25364,
    "comments": "comments",
    "dateSentToCsnr": "2023-07-01T23:59:59.999-07:00",
    "emissionFunctionalUnit":"tCO2e",
    "measurementPeriodEndDate":"2023-07-01T23:59:59.999-07:00",
    "measurementPeriodStartDate": "2023-06-01T23:59:59.999-07:00",
    "postProjectEmissionIntensity": 124.35,
    "productionFunctionalUnit": "unit",
    "reportDueDate": "2023-06-15T23:59:59.999-07:00",
    "reportType": "TEIMP",
    "reportingRequirementIndex": 1,
    "submittedDate": "2023-06-30T23:59:59.999-07:00",
    "targetEmissionIntensity": 23.2357,
    "totalLifetimeEmissionReduction": 44.4224
  }', null, 1, 'staged', '[]');

select cif.create_form_change('update', 'project', 'cif', 'project', '{}', 1, 1, 'pending', '[]');

/** SETUP END **/

select results_eq(
  $$
  with record as (
    select row(form_change.*)::cif.form_change from cif.form_change where id = 1
  ) select cif_private.handle_emission_intensity_form_change_commit((select * from record));
  $$,
  $$
  values (
    7
  )
  $$,
  'Returns the form_data_record_id when new_form_data is empty'
);

select throws_like(
  $$
  with record as (
    select row(form_change.*)::cif.form_change from cif.form_change where id = 2
  ) select cif_private.handle_emission_intensity_form_change_commit((select * from record));
  $$,
  'Cannot commit form_change. It has already been committed.',
  'Throws an exception if the form_change has a change_status of committed'
);


/** The next two tests confirm that the correct values were added to their two corresponsing tables (reporting_requirement and emission_intensity_report)
 after performing the commit, when the form_change operation is "create"

**/
select cif_private.handle_emission_intensity_form_change_commit((select row(form_change.*)::cif.form_change from cif.form_change where id = 3));
-- reporting_requiement table
select results_eq(
  $$
  select report_due_date, submitted_date, comments, reporting_requirement_index from cif.reporting_requirement where id = 1;
  $$,
  $$
  values (
  '2023-06-15T23:59:59.999-07:00'::timestamptz,
  '2023-06-30T23:59:59.999-07:00'::timestamptz,
  'comments'::varchar,
  1
  )
  $$,
  'The correct values were added to the reporting_requiement table on create'
);
-- emission_intensity_report table
select results_eq(
  $$
    select
        reporting_requirement_id,
        measurement_period_start_date,
        measurement_period_end_date,
        emission_functional_unit,
        production_functional_unit,
        baseline_emission_intensity,
        target_emission_intensity,
        post_project_emission_intensity,
        total_lifetime_emission_reduction,
        adjusted_emissions_intensity_performance,
        adjusted_holdback_payment_amount,
        date_sent_to_csnr
    from cif.emission_intensity_report where id = 1;
  $$,
  $$
  values (
    1,
    '2023-06-01T23:59:59.999-07:00'::timestamptz,
    '2023-07-01T23:59:59.999-07:00'::timestamptz,
    'tCO2e'::varchar,
    'unit'::varchar,
    324.25364::numeric,
    23.2357::numeric,
    124.35::numeric,
    44.4224::numeric,
    98::numeric,
    null::numeric,
    '2023-07-01T23:59:59.999-07:00'::timestamptz
  )
  $$,
  'The correct values were added to the emission_intensity_report table on create'
);


-- The next two tests confirm that the correct values were added to their two corresponsing tables when the form_change operation is "update"
update cif.project_revision set change_status = 'committed' where id = 1;
insert into cif.project_revision(id, change_status, project_id)
  overriding system value
  values (2, 'pending', 1);

select cif.create_form_change('update', 'emission_intensity', 'cif', 'reporting_requirement',
  '{
   "adjustedEmissionsIntensityPerformance": 63,
    "baselineEmissionIntensity": 2369.2,
    "comments": "new comments",
    "dateSentToCsnr": "2024-05-23T23:59:59.999-07:00",
    "emissionFunctionalUnit":"unit 1",
    "measurementPeriodEndDate":"2030-11-29T23:59:59.999-07:00",
    "measurementPeriodStartDate": "2028-11-29T23:59:59.999-07:00",
    "postProjectEmissionIntensity": 56.35526875,
    "productionFunctionalUnit": "unit 2",
    "reportDueDate": "2026-06-25T23:59:59.999-07:00",
    "reportType": "TEIMP",
    "reportingRequirementIndex": 1,
    "submittedDate": "2029-09-30 14:24:46.318423-07",
    "targetEmissionIntensity": 23.2357,
    "totalLifetimeEmissionReduction": 9999.48,
    "holdbackAmountToDate": 595.22
  }', 1, 2, 'staged', '[]');

select cif_private.handle_emission_intensity_form_change_commit((select row(form_change.*)::cif.form_change from cif.form_change where id = 5));
-- reporting_requiement table
select results_eq(
  $$
  select report_due_date, submitted_date, comments, reporting_requirement_index from cif.reporting_requirement where id = 1;
  $$,
  $$
  values (
  '2026-06-25T23:59:59.999-07:00'::timestamptz,
  '2029-09-30 14:24:46.318423-07'::timestamptz,
  'new comments'::varchar,
  1
  )
  $$,
  'The correct values were added to the reporting_requiement table on update'
);
-- emission_intensity_report table
select results_eq(
  $$
    select
        reporting_requirement_id,
        measurement_period_start_date,
        measurement_period_end_date,
        emission_functional_unit,
        production_functional_unit,
        baseline_emission_intensity,
        target_emission_intensity,
        post_project_emission_intensity,
        total_lifetime_emission_reduction,
        adjusted_emissions_intensity_performance,
        adjusted_holdback_payment_amount,
        date_sent_to_csnr
    from cif.emission_intensity_report where id = 1;
  $$,
  $$
  values (
    1,
    '2028-11-29T23:59:59.999-07:00'::timestamptz,
    '2030-11-29T23:59:59.999-07:00'::timestamptz,
    'unit 1'::varchar,
    'unit 2'::varchar,
    2369.2::numeric,
    23.2357::numeric,
    56.35526875::numeric,
    9999.48::numeric,
    63::numeric,
    595.22::numeric,
    '2024-05-23T23:59:59.999-07:00'::timestamptz
  )
  $$,
  'The correct values were added to the emission_intensity_report table on create'
);


select finish();

rollback;
