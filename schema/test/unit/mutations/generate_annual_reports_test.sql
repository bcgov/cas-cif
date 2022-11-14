begin;

select plan(3);

truncate cif.project restart identity cascade;
select cif.create_project();

select throws_like(
  $$
    select * from cif.generate_annual_reports((select id from cif.project_revision order by id desc limit 1), '2021-01-01', '2020-01-01');
  $$,
  'start_date must be before end_date',
    'Cannot generate reports if start_date is after or the same as end_date'
);

select results_eq(
  $$
    select
      id,
      new_form_data,
      operation,
      form_data_schema_name,
      form_data_table_name,
      form_data_record_id,
      project_revision_id,
      json_schema_name
      from cif.generate_annual_reports((select id from cif.project_revision order by id desc limit 1), '2022-01-01', '2026-01-01');
  $$,
  $$
    values (
      2,
      format(
        '{"projectId": 1, "reportType": "Annual", "reportDueDate": "%s", "reportingRequirementIndex": 1}',
        to_char(date_trunc('day', '2023-01-30'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      1::integer,
      'reporting_requirement'::varchar
    ),
    (
      3,
      format(
        '{"projectId": 1, "reportType": "Annual", "reportDueDate": "%s", "reportingRequirementIndex": 2}',
        to_char(date_trunc('day', '2024-01-30'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      1::integer,
      'reporting_requirement'::varchar
    ),
    (
      4,
      format(
        '{"projectId": 1, "reportType": "Annual", "reportDueDate": "%s", "reportingRequirementIndex": 3}',
        to_char(date_trunc('day', '2025-01-30'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      1::integer,
      'reporting_requirement'::varchar
    ),
    (
      5,
      format(
        '{"projectId": 1, "reportType": "Annual", "reportDueDate": "%s", "reportingRequirementIndex": 4}',
        to_char(date_trunc('day', '2026-01-30'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      1::integer,
      'reporting_requirement'::varchar
    )
  $$,
  'Generate annual reports between start_date and end_date when start_date is before 30th of January'
);

select cif.create_project();

select results_eq(
  $$
    select
      id,
      new_form_data,
      operation,
      form_data_schema_name,
      form_data_table_name,
      form_data_record_id,
      project_revision_id,
      json_schema_name
      from cif.generate_annual_reports((select id from cif.project_revision order by id desc limit 1), '2022-02-01', '2026-01-01');
  $$,
  $$
    values (
      7,
      format(
        '{"projectId": 2, "reportType": "Annual", "reportDueDate": "%s", "reportingRequirementIndex": 1}',
        to_char(date_trunc('day', '2024-01-30'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      2::integer,
      'reporting_requirement'::varchar
    ),
    (
      8,
      format(
        '{"projectId": 2, "reportType": "Annual", "reportDueDate": "%s", "reportingRequirementIndex": 2}',
        to_char(date_trunc('day', '2025-01-30'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      2::integer,
      'reporting_requirement'::varchar
    ),
    (
      9,
      format(
        '{"projectId": 2, "reportType": "Annual", "reportDueDate": "%s", "reportingRequirementIndex": 3}',
        to_char(date_trunc('day', '2026-01-30'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      2::integer,
      'reporting_requirement'::varchar
    )
  $$,
  'Generate annual reports between start_date and end_date when start_date is after 30th of January'
);

rollback;
