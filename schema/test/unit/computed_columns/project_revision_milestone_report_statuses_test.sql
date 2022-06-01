begin;

select * from no_plan();

/** SETUP */

truncate cif.project_revision restart identity cascade;

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending'), (2, 'pending');
insert into cif.form_change(id, new_form_data, operation, change_status, form_data_schema_name, form_data_table_name, project_revision_id, json_schema_name, validation_errors)
  overriding system value
  values
    (1, '{"reportType":"Quarterly"}','create', 'pending', 'cif', 'reporting_requirement', 1, 'reporting_requirement', '[]'),
    (2, '{"status": "on_track", "projectId": 1, "reportType": "General Milestone", "reportingRequirementIndex": 1}','create', 'pending', 'cif', 'reporting_requirement', 1, 'reporting_requirement', '[]'),
    (3, '{"status": "on_track", "projectId": 1, "reportType": "Advanced Milestone", "reportingRequirementIndex": 2}','create', 'staged', 'cif', 'reporting_requirement', 1, 'reporting_requirement', '[]'),
    (4, '{"status": "on_track", "projectId": 1, "reportType": "Reporting Milestone", "reportingRequirementIndex": 3}','create', 'staged', 'cif', 'reporting_requirement', 1, 'reporting_requirement', '[{"error": "yes"}]'),
    (5, '{"reportType":"Quarterly"}','create', 'pending', 'cif', 'reporting_requirement', 2, 'reporting_requirement', '[]');

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
      ((-1::int, 'on_track'::text, null)::cif.milestone_report_status_return),
      ((1::int, 'on_track'::text ,'In Progress'::text)::cif.milestone_report_status_return),
      ((2::int, 'on_track'::text, 'Filled'::text)::cif.milestone_report_status_return),
      ((3::int, 'on_track'::text, 'Attention Required':: text)::cif.milestone_report_status_return)
  $$,
  'Returns the correct data when all milestones are on_track'
);

-- Change a mileston status to 'late'
update cif.form_change set new_form_data = '{"status": "late", "projectId": 1, "reportType": "General Milestone", "reportingRequirementIndex": 1}' where id=2;

select results_eq(
  $$
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select cif.project_revision_milestone_report_statuses((select * from record))
  $$,
  $$
    values
      ((-1::int, 'late'::text, null)::cif.milestone_report_status_return),
      ((1::int, 'late'::text ,'In Progress'::text)::cif.milestone_report_status_return),
      ((2::int, 'on_track'::text, 'Filled'::text)::cif.milestone_report_status_return),
      ((3::int, 'on_track'::text, 'Attention Required':: text)::cif.milestone_report_status_return)
  $$,
  'Returns the correct data when a milestone is late'
);

select results_eq(
  $$
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=2
    ) select cif.project_revision_milestone_report_statuses((select * from record))
  $$,
  $$
    values
      ((-1::int, 'on_track'::text, null)::cif.milestone_report_status_return)
  $$,
  'Returns a single overall status record when there are no milestones in the revision'
);

select finish();

rollback;
