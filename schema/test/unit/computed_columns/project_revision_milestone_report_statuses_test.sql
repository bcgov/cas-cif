begin;

select * from no_plan();

/** SETUP */

truncate cif.project_revision restart identity cascade;

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending');
insert into cif.form_change(id, new_form_data, operation, change_status, form_data_schema_name, form_data_table_name, project_revision_id, json_schema_name, validation_errors)
  overriding system value
  values
    (2, format('{"reportDueDate": "%s", "projectId": 1, "reportType": "General Milestone", "reportingRequirementIndex": 1}', now() + interval '2 days')::jsonb,'create', 'pending', 'cif', 'reporting_requirement', 1, 'reporting_requirement', '[]'),
    (3, format('{"reportDueDate": "%s", "projectId": 1, "reportType": "Advanced Milestone", "reportingRequirementIndex": 2}', now() - interval '2 days')::jsonb, 'create', 'staged', 'cif', 'reporting_requirement', 1, 'reporting_requirement', '[]'),
    (4, format('{"reportDueDate": "%s", "submittedDate": "%s", "projectId": 1, "reportType": "Reporting Milestone", "reportingRequirementIndex": 3}', now() + interval '2 days', now())::jsonb, 'create', 'staged', 'cif', 'reporting_requirement', 1, 'reporting_requirement', '[{"error": "yes"}]');

/** END SETUP */

select results_eq(
  $$
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select cif.project_revision_milestone_report_statuses((select * from record))
  $$,
  $$
    values
      ((1::int, 'onTrack'::text ,'In Progress'::text)::cif.milestone_report_status_return),
      ((2::int, 'late'::text, 'Filled'::text)::cif.milestone_report_status_return),
      ((3::int, 'completed'::text, 'Attention Required'::text)::cif.milestone_report_status_return)
  $$,
  'Returns the correct data'
);

select finish();

rollback;
