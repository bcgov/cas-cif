begin;

select no_plan();

/** TEST SETUP **/
truncate cif.project restart identity cascade;

insert into cif.cif_user(id, session_sub)
  overriding system value
  values (1, '11111111-1111-1111-1111-111111111111');

insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values
  (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD');

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
overriding system value
values
  (1, 1, 1, 1, '001', 'summary 1', 'project 1'),
  (2, 1, 1, 1, '002', 'summary 2', 'project 2');

insert into cif.project_revision(id, change_status, change_reason, project_id)
overriding system value
values
-- brianna why is 1 the latest committed project revision?
  -- revisions for project 1
  (1, 'committed', 'reason for change 2', 1),
  (2, 'pending', 'reason for change 2', 1),
  -- revisions for project 2
  (3, 'committed', 'reason for change 3', 2);

update cif.project_revision set change_status='committed', change_reason = 'make updated_at most recent' where id = 2;

insert into cif.form(slug, json_schema, description) values ('schema', '{}'::jsonb, 'test description');

insert into cif.form_change(
  id,
  new_form_data,
  operation,
  change_status,
  form_data_schema_name,
  form_data_table_name,
  json_schema_name,
  project_revision_id,
  validation_errors)
overriding system value
values
(
  1,
  '{"testField": "test value 1"}',
  'create',
  'committed',
  'cif',
  'test_table_name',
  'schema',
  1,
  '[]'
),(
    2,
  '{"testField": "test value 2"}',
  'update',
  'committed',
  'cif',
  'test_table_name',
  'schema',
  2, -- project rev 2 (latest committed) on project 1
  '[]'
),
(
  3,
  '{"testField": "test value 3"}',
  'create',
  'pending',
  'cif',
  'test_table_name_2', -- different table name
  'schema',
  2, -- project rev 2 (latest committed) on project 1
  '[]'
),
(
  4,
  '{"testField": "test value 4"}',
  'archive',
  'committed',
  'cif',
  'test_table_name',
  'schema',
  3,
  '[]'
),
(
    6,
  '{"testField": "test value", "reportType":"Annual"}',
  'create',
  'committed',
  'cif',
  'reporting_requirement',
  'schema',
  2,
  '[]'
),
(
    7,
  '{"testField": "test value", "reportType":"Quarterly"}',
  'create',
  'committed',
  'cif',
  'reporting_requirement',
  'schema',
  2,
  '[]'
),
(
    8,
  '{"testField": "test value", "reportType":"General Milestone"}',
  'create',
  'committed',
  'cif',
  'reporting_requirement',
  'schema',
  2,
  '[]'
),
(
    9,
  '{"testField": "test value", "reportType":"Advanced Milestone"}',
  'create',
  'committed',
  'cif',
  'reporting_requirement',
  'schema',
  2,
  '[]'
),
(
    10,
  '{"testField": "test value", "reportType":"Performance Milestone"}',
  'create',
  'committed',
  'cif',
  'reporting_requirement',
  'schema',
  2,
  '[]'
),
(
    11,
  '{"testField": "test value", "reportType":"Reporting Milestone"}',
  'create',
  'committed',
  'cif',
  'reporting_requirement',
  'schema',
  2,
  '[]'
);

/* END SETUP */

select results_eq(
  $$
    select (fc).id from cif.project_revision_latest_committed_form_changes_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=2), 'test_table_name') fc
  $$,
  $$
    values (2)
  $$,
  'Returns the correct form_change records from test_table_name from the latest committed project revision'
);

select results_eq(
  $$
    select (fc).id from cif.project_revision_latest_committed_form_changes_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=3), 'test_table_name') fc
  $$,
  $$
    values (4)
  $$,
  'Returns the correct (archived) form_change records from test_table_name from the latest committed project revision'
);

select results_eq(
  $$
    select (fc).id from cif.project_revision_latest_committed_form_changes_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=2), 'reporting_requirement', report_type => 'Annual') fc
  $$,
  $$
    values (6)
  $$,
  'Returns the correct form_change records when queried with report_type Annual'
);

select results_eq(
  $$
    select (fc).id from cif.project_revision_latest_committed_form_changes_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=2), 'reporting_requirement', report_type => 'Quarterly') fc
  $$,
  $$
    values (7)
  $$,
  'Returns the correct form_change records when queried with report_type Quarterly'
);

select results_eq(
  $$
    select (fc).id from cif.project_revision_latest_committed_form_changes_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=2), 'reporting_requirement', report_type => 'Milestone') fc
  $$,
  $$
    values (8), (9), (10), (11)
  $$,
  'Returns the correct form_change records when queried with report_type Milestone'
);

select is(
  (select (fc).id from cif.project_revision_latest_committed_form_changes_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=12), 'reporting_requirement', report_type => 'Milestone') fc),
  null,
  'Returns null when queried for milestone reports and none exist for given project_revision'
);

select finish();
rollback;
