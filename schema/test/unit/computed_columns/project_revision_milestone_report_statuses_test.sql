begin;

select * from no_plan();

/** SETUP */

truncate cif.project restart identity cascade;

insert into cif.project_revision(id, change_status)
  overriding system value
  values (1, 'pending'), (2, 'pending'), (3, 'committed');

insert into cif.form_change(id, new_form_data, operation, change_status, form_data_schema_name, form_data_table_name, form_data_record_id, project_revision_id, json_schema_name, validation_errors)
  overriding system value
  values
    (2,
     format('{"reportDueDate": "%s", "projectId": 1, "reportType": "General Milestone", "reportingRequirementIndex": 1}',
     now() + interval '2 days')::jsonb,
     'create',
     'pending',
     'cif',
     'reporting_requirement',
     1,
     1,
     'milestone',
     '[]'),
    (3,
     format('{"reportDueDate": "%s", "projectId": 1, "reportType": "General Milestone", "reportingRequirementIndex": 1}',
     now() + interval '2 days')::jsonb,
     'archive',
     'committed',
     'cif',
     'reporting_requirement',
     1,
     3,
     'milestone',
     '[]');

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
      ((1::int, now() + interval '2 days', null, 'In Progress'::text)::cif.milestone_report_status_return)
  $$,
  'Returns the correct data for In Progress status'
);

-- Stage form changes
update cif.form_change set change_status = 'staged' where project_revision_id = 1;

select results_eq(
  $$
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select cif.project_revision_milestone_report_statuses((select * from record))
  $$,
  $$
    values
      ((1::int, now() + interval '2 days', null, 'Filled'::text)::cif.milestone_report_status_return)
  $$,
  'Returns the correct data for Filled status'
);

-- Add errors
update cif.form_change set validation_errors = '[{"errors": true}]' where id = 2;

select results_eq(
  $$
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=1
    ) select cif.project_revision_milestone_report_statuses((select * from record))
  $$,
  $$
    values
      ((1::int, now() + interval '2 days', null, 'Attention Required'::text)::cif.milestone_report_status_return)
  $$,
  'Returns the correct data for Attention Required status'
);

-- Create new form_change records & link them the the previous records
insert into cif.form_change(id, new_form_data, operation, change_status, form_data_schema_name, form_data_table_name, form_data_record_id, project_revision_id, json_schema_name, validation_errors)
  overriding system value
  values
    (22,
     format('{"reportDueDate": "%s", "projectId": 1, "reportType": "General Milestone", "reportingRequirementIndex": 1}',
     now() + interval '2 days')::jsonb,
     'create',
     'pending',
     'cif',
     'reporting_requirement',
     1,
     2,
     'milestone',
     '[]');

update cif.form_change set previous_form_change_id = 2 where id = 22;

select results_eq(
  $$
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=2
    ) select cif.project_revision_milestone_report_statuses((select * from record))
  $$,
  $$
    values
      ((1::int, now() + interval '2 days', null, 'No Changes'::text)::cif.milestone_report_status_return)
  $$,
  'Returns the correct data for No Changes status'
);

select is_empty(
  $$
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=3
    ) select cif.project_revision_milestone_report_statuses((select * from record))
  $$,
  'Returns nothing if the form change operation is archive'
);

select finish();

rollback;
