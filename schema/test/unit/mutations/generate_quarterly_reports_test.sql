begin;

select plan(4);

truncate cif.project restart identity cascade;
select cif.create_project(1);

select throws_like(
  $$
    select * from cif.generate_quarterly_reports((select id from cif.project_revision order by id desc limit 1), '2021-01-01', '2020-01-01');
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
      from cif.generate_quarterly_reports((select id from cif.project_revision order by id desc limit 1), '2022-10-04', '2023-10-10');
  $$,
  $$
    values (
      2,
      format(
        '{"projectId": 1, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 1}',
        to_char(date_trunc('day', '2022-10-05'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
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
        '{"projectId": 1, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 2}',
        to_char(date_trunc('day', '2023-01-05'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
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
        '{"projectId": 1, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 3}',
        to_char(date_trunc('day', '2023-04-05'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
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
        '{"projectId": 1, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 4}',
        to_char(date_trunc('day', '2023-07-05'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      1::integer,
      'reporting_requirement'::varchar
    ),
    (
      6,
      format(
        '{"projectId": 1, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 5}',
        to_char(date_trunc('day', '2023-10-05'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      1::integer,
      'reporting_requirement'::varchar
    ),
    (
      7,
      format(
        '{"projectId": 1, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 6}',
        to_char(date_trunc('day', '2024-01-05'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      1::integer,
      'reporting_requirement'::varchar
    )
  $$,
  'Generate quarterly reports between start_date and end_date when start_date is before 5th of October'
);

select cif.create_project(1);

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
      from cif.generate_quarterly_reports((select id from cif.project_revision order by id desc limit 1), '2022-10-10', '2023-04-10');
  $$,
  $$
    values (
      9,
      format(
        '{"projectId": 2, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 1}',
        to_char(date_trunc('day', '2023-01-05'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      2::integer,
      'reporting_requirement'::varchar
    ),
    (
      10,
      format(
        '{"projectId": 2, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 2}',
        to_char(date_trunc('day', '2023-04-05'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      2::integer,
      'reporting_requirement'::varchar
    ),
    (
      11,
      format(
        '{"projectId": 2, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 3}',
        to_char(date_trunc('day', '2023-07-05'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      2::integer,
      'reporting_requirement'::varchar
    )
  $$,
  'Generate quarterly reports between start_date and end_date when start_date is after 5th of October'
);

select cif.create_project(1);

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
      from cif.generate_quarterly_reports((select id from cif.project_revision order by id desc limit 1), '2022-10-05', '2023-03-10');
  $$,
  $$
    values (
      13,
      format(
        '{"projectId": 3, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 1}',
        to_char(date_trunc('day', '2022-10-05'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
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
        '{"projectId": 3, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 2}',
        to_char(date_trunc('day', '2023-01-05'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
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
        '{"projectId": 3, "reportType": "Quarterly", "reportDueDate": "%s", "reportingRequirementIndex": 3}',
        to_char(date_trunc('day', '2023-04-05'::timestamptz) + interval '1 day' - interval '1 second', 'YYYY-MM-DD"T"HH24:MI:SSTZH:TZM')
      )::jsonb,
      'create'::cif.form_change_operation,
      'cif'::varchar,
      'reporting_requirement'::varchar,
      null::integer,
      3::integer,
      'reporting_requirement'::varchar
    )
  $$,
  'Generate quarterly reports between start_date and end_date when start_date is 5th of October'
);

rollback;
