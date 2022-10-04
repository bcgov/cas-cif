begin;

select plan(9);

truncate cif.project restart identity cascade;
select cif.create_project();

select throws_like(
  $$
    select * from cif.generate_reports((select id from cif.project_revision order by id desc limit 1), 'Annual', '2021-01-01', '2020-01-01');
  $$,
  'start_date must be before end_date',
    'Cannot generate reports if start_date is after or the same as end_date'
);

-- Annual report tests
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
      from cif.generate_reports((select id from cif.project_revision order by id desc limit 1), 'Annual', '2022-01-01', '2026-01-01');
  $$,
  $$
    values (
      2,
      format(
        '{"projectId": 1, "reportType": "Annual", "reportDueDate": "%s", "reportingRequirementIndex": 1}',
        '2022-01-31T00:00:00-08:00'
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
        '2023-01-31T00:00:00-08:00'
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
        '2024-01-31T00:00:00-08:00'
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
        '2025-01-31T00:00:00-08:00'
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      1::integer,
      'reporting_requirement'::varchar
    )
  $$,
  'Generate annual reports between start_date and end_date when start_date is before 31st of January'
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
      from cif.generate_reports((select id from cif.project_revision order by id desc limit 1), 'Annual', '2022-02-01', '2024-01-01');
  $$,
  $$
    values (
      7,
      format(
        '{"projectId": 2, "reportType": "Annual", "reportDueDate": "%s", "reportingRequirementIndex": 1}',
        '2023-01-31T00:00:00-08:00'
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      2::integer,
      'reporting_requirement'::varchar
    )
  $$,
  'Generate annual reports between start_date and end_date when start_date is after 31st of January'
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
      from cif.generate_reports((select id from cif.project_revision order by id desc limit 1), 'Annual', '2022-01-31', '2024-01-01');
  $$,
  $$
    values (
      9,
      format(
        '{"projectId": 3, "reportType": "Annual", "reportDueDate": "%s", "reportingRequirementIndex": 1}',
        '2022-01-31T00:00:00-08:00'
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      3::integer,
      'reporting_requirement'::varchar
    ),
    (
      10,
      format(
        '{"projectId": 3, "reportType": "Annual", "reportDueDate": "%s", "reportingRequirementIndex": 2}',
        '2023-01-31T00:00:00-08:00'
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      3::integer,
      'reporting_requirement'::varchar
    )
  $$,
  'Generate annual reports between start_date and end_date when start_date is 31st of January'
);

select is_empty(
  $$
    select * from cif.generate_reports((select id from cif.project_revision order by id desc limit 1), 'Annual', '2022-02-01', '2022-03-01');
  $$,
  'Generate no annual reports when start_date is the after 31st of January and end_date is before next years 31st of January'
);


-- Quarterly report tests

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
      from cif.generate_reports((select id from cif.project_revision order by id desc limit 1), 'Quarterly', '2022-10-04', '2023-10-10');
  $$,
  $$
    values (
      11,
      format(
        '{"projectId": 3, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 1}',
        '2022-10-05T00:00:00-07:00'
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      3::integer,
      'reporting_requirement'::varchar
    ),
    (
      12,
      format(
        '{"projectId": 3, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 2}',
        '2023-01-05T00:00:00-08:00'
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      3::integer,
      'reporting_requirement'::varchar
    ),
    (
      13,
      format(
        '{"projectId": 3, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 3}',
        '2023-04-05T00:00:00-07:00'
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      3::integer,
      'reporting_requirement'::varchar
    ),
    (
      14,
      format(
        '{"projectId": 3, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 4}',
        '2023-07-05T00:00:00-07:00'
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      3::integer,
      'reporting_requirement'::varchar
    ),
    (
      15,
      format(
        '{"projectId": 3, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 5}',
        '2023-10-05T00:00:00-07:00'
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      3::integer,
      'reporting_requirement'::varchar
    )
  $$,
  'Generate quarterly reports between start_date and end_date when start_date is before 5th of October'
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
      from cif.generate_reports((select id from cif.project_revision order by id desc limit 1), 'Quarterly', '2022-10-10', '2023-04-10');
  $$,
  $$
    values (
      17,
      format(
        '{"projectId": 4, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 1}',
        '2023-01-05T00:00:00-08:00'
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      4::integer,
      'reporting_requirement'::varchar
    ),
    (
      18,
      format(
        '{"projectId": 4, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 2}',
        '2023-04-05T00:00:00-07:00'
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      4::integer,
      'reporting_requirement'::varchar
    )
  $$,
  'Generate quarterly reports between start_date and end_date when start_date is after 5th of October'
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
      from cif.generate_reports((select id from cif.project_revision order by id desc limit 1), 'Quarterly', '2022-10-05', '2023-03-10');
  $$,
  $$
    values (
      20,
      format(
        '{"projectId": 5, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 1}',
        '2022-10-05T00:00:00-07:00'
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      5::integer,
      'reporting_requirement'::varchar
    ),
    (
      21,
      format(
        '{"projectId": 5, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 2}',
        '2023-01-05T00:00:00-08:00'
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      5::integer,
      'reporting_requirement'::varchar
    )
  $$,
  'Generate quarterly reports between start_date and end_date when start_date is 5th of October'
);

select is_empty(
  $$
    select * from cif.generate_reports((select id from cif.project_revision order by id desc limit 1), 'Quarterly', '2022-02-10', '2022-03-01');
  $$,
  'Generate no quarterly reports when start_date and end_date are before the first report due date'
);

rollback;
