begin;

select plan(6);

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
  (1, 1, 1, 1, '000', 'summary', 'project 1');

insert into cif.project_revision(id, change_status, change_reason, project_id, is_first_revision)
overriding system value
values
  (1, 'committed', 'reason for change', 1, false);

insert into cif.form(slug, json_schema, description) values ('schema', '{}'::jsonb, 'test description');

alter table cif.form_change disable trigger _set_previous_form_change_id;
insert into cif.form_change(
  new_form_data,
  operation,
  change_status,
  form_data_schema_name,
  form_data_table_name,
  json_schema_name,
  previous_form_change_id,
  project_revision_id,
  validation_errors)
values (
  '{"testField": "test value"}',
  'create',
  'pending',
  'cif',
  'test_table_name',
  'schema',
  null,
  1,
  '[]'
),(
  '{"testField": "test value"}',
  'update',
  'pending',
  'cif',
  'test_table_name',
  'schema',
  1,
  1,
  '[]'
),
('{"testField": "test value", "ExtraData":"TestOne"}',
  'create',
  'pending',
  'cif',
  'test_table_with_extra_data',
  'schema',
  null,
  1,
  '[]'
),(
  '{"testField": "test value", "ExtraData":"TestOne"}',
  'update',
  'pending',
  'cif',
  'test_table_with_extra_data',
  'schema',
  4,
  1,
  '[]'
),
-- This form is a decoy to make sure we test the json filtering
('{"testField": "test value", "ExtraData":"TestTwo"}',
  'create',
  'staged',
  'cif',
  'test_table_with_extra_data',
  'schema',
  null,
  1,
  '[]'
),
(
  '{"testField": "test value", "reportType":"Annual"}',
  'create',
  'pending',
  'cif',
  'reporting_requirement',
  'schema',
  null,
  1,
  '[]'
),
(
  '{"testField": "test value", "reportType":"Quarterly"}',
  'create',
  'pending',
  'cif',
  'reporting_requirement',
  'schema',
  null,
  1,
  '[]'
),
(
  '{"testField": "test value", "reportType":"General Milestone"}',
  'create',
  'pending',
  'cif',
  'reporting_requirement',
  'schema',
  null,
  1,
  '[]'
),
(
  '{"testField": "test value", "reportType":"Advanced Milestone"}',
  'create',
  'pending',
  'cif',
  'reporting_requirement',
  'schema',
  null,
  1,
  '[]'
),
(
  '{"testField": "test value", "reportType":"Performance Milestone"}',
  'create',
  'pending',
  'cif',
  'reporting_requirement',
  'schema',
  null,
  1,
  '[]'
),
(
  '{"testField": "test value", "reportType":"Reporting Milestone"}',
  'create',
  'pending',
  'cif',
  'reporting_requirement',
  'schema',
  null,
  1,
  '[]'
),
(
  '{"testField": "test value", "reportType":"Interim Summary Report"}',
  'create',
  'pending',
  'cif',
  'reporting_requirement',
  'schema',
  null,
  1,
  '[]'
);

/* END SETUP */

select results_eq(
  $$
    select (fc).id from cif.project_revision_form_changes_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=1), 'test_table_name') fc
  $$,
  $$
    values (1), (2)
  $$,
  'Returns the correct form_change records when queried without a json matcher'
);

select results_eq(
  $$
    select (fc).id from cif.project_revision_form_changes_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=1), 'test_table_with_extra_data', '{"ExtraData":"TestOne"}') fc
  $$,
  $$
    values (3), (4)
  $$,
  'Returns the correct form_change records when queried with a json matcher'
);

select results_eq(
  $$
    select (fc).id from cif.project_revision_form_changes_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=1), 'reporting_requirement', report_type => 'Annual') fc
  $$,
  $$
    values (6)
  $$,
  'Returns the correct form_change records when queried with report_type Annual'
);

select results_eq(
  $$
    select (fc).id from cif.project_revision_form_changes_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=1), 'reporting_requirement', report_type => 'Quarterly') fc
  $$,
  $$
    values (7)
  $$,
  'Returns the correct form_change records when queried with report_type Quarterly'
);

select results_eq(
  $$
    select (fc).id from cif.project_revision_form_changes_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=1), 'reporting_requirement', report_type => 'Milestone') fc
  $$,
  $$
    values (8), (9), (10), (11), (12)
  $$,
  'Returns the correct form_change records when queried with report_type Milestone'
);

select is(
  (select (fc).id from cif.project_revision_form_changes_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=12), 'reporting_requirement', report_type => 'Milestone') fc),
  null,
  'Returns null when queried for milestone reports and none exist for given project_revision'
);

select finish();
rollback;
