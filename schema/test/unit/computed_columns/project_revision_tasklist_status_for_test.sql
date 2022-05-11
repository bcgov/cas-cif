begin;

select plan(13);

/** TEST SETUP **/
truncate cif.project restart identity cascade;

insert into cif.cif_user(id, uuid)
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

insert into cif.project_revision(id, change_status, change_reason, project_id)
overriding system value
values
  (1, 'committed', 'reason for change', 1),
  (2, 'committed', 'reason for change', 1),
  (3, 'committed', 'reason for change', 1),
  (4, 'committed', 'reason for change', 1);

alter table cif.form_change disable trigger _set_previous_form_change_id;
alter table cif.form_change disable trigger commit_form_change;

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
  -- previous form change
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
  -- pending, is_pristine = true
  '{"testField": "test value"}',
  'update',
  'pending',
  'cif',
  'test_table_name',
  'schema',
  1,
  2,
  '[]'
),(
  -- staged, no validation errors
  '{"testField": "test value"}',
  'update',
  'staged',
  'cif',
  'test_table_name',
  'schema',
  null,
  3,
  '[]'
),
-- previous form change
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
  -- pending, is_pristine = true
  '{"testField": "test value", "ExtraData":"TestOne"}',
  'update',
  'pending',
  'cif',
  'test_table_with_extra_data',
  'schema',
  4,
  2,
  '[]'
),(
  -- staged, no validation errors
  '{"testField": "test value", "ExtraData":"TestOne"}',
  'update',
  'staged',
  'cif',
  'test_table_with_extra_data',
  'schema',
  null,
  3,
  '[]'
),
-- These forms are a decoy to make sure we test the json filtering
-- They should not be taken in account when computing the status with the json_matcher
-- previous form change
('{"testField": "test value", "ExtraData":"TestTwo"}',
  'create',
  'staged',
  'cif',
  'test_table_with_extra_data',
  'schema',
  null,
  1,
  '[]'
),(
  -- pending, is_pristine = true
  '{"testField": "test value", "ExtraData":"TestTwo"}',
  'update',
  'staged',
  'cif',
  'test_table_with_extra_data',
  'schema',
  7,
  2,
  '[{"I_have_errors":"true"}]'
),(
  -- staged, no validation errors
  '{"testField": "test value", "ExtraData":"TestTwo"}',
  'update',
  'staged',
  'cif',
  'test_table_with_extra_data',
  'schema',
  null,
  3,
  '[]'
);



/* END SETUP */

/* Without Json Matching */

select is(
  (
    select cif.project_revision_tasklist_status_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=1), 'test_table_name')
  ),
  'Incomplete',
  'Returns Incomplete, when change_status is pending and is_pristine is null'
);

select is(
  (
    select cif.project_revision_tasklist_status_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=2), 'test_table_name')
  ),
  'Not Started',
  'Returns Not Started, when change_status is pending and is_pristine is true'
);

-- Change new_form_data to make is_pristine = false
update cif.form_change set new_form_data = '{"testField": "changed value"}' where id = 2;

select is(
  (
    select cif.project_revision_tasklist_status_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=2), 'test_table_name')
  ),
  'Incomplete',
  'Returns Incomplete, when change_status is pending and is_pristine is false'
);

select is(
  (
    select cif.project_revision_tasklist_status_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=3), 'test_table_name')
  ),
  'Complete',
  'Returns Complete, when change_status is staged and validation_errors is empty'
);

-- Add validation_errors
update cif.form_change set validation_errors = '[{"error": "has error"}]' where id = 3;

select is(
  (
    select cif.project_revision_tasklist_status_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=3), 'test_table_name')
  ),
  'Attention Required',
  'Returns Attention Required, when change_status is staged and validation_errors is not empty'
);

-- it returns Complete when there are no form_change records for that table
select is(
  (
    select cif.project_revision_tasklist_status_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=3), 'table_that_does_not_have_form_changes')
  ),
  'Not Started',
  'Returns Not Started, when there are no form_change records for that table'
);

-- it returns null when the table argument is null
select is(
  (
    select cif.project_revision_tasklist_status_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=3), null)
  ),
  null,
  'Returns null when the table argument is null'
);


/* With Json Matching */

select is(
  (
    select cif.project_revision_tasklist_status_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=1), 'test_table_with_extra_data', '{"ExtraData":"TestOne"}')
  ),
  'Incomplete',
  'Returns Incomplete, when change_status is pending and is_pristine is null'
);

select is(
  (
    select cif.project_revision_tasklist_status_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=2), 'test_table_with_extra_data', '{"ExtraData":"TestOne"}')
  ),
  'Not Started',
  'Returns Not Started, when change_status is pending and is_pristine is true'
);

-- Change new_form_data to make is_pristine = false
update cif.form_change set new_form_data = '{"testField": "changed value", "ExtraData": "TestOne"}' where id = 5;

select is(
  (
    select cif.project_revision_tasklist_status_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=2), 'test_table_with_extra_data', '{"ExtraData":"TestOne"}')
  ),
  'Incomplete',
  'Returns Incomplete, when change_status is pending and is_pristine is false'
);

select is(
  (
    select cif.project_revision_tasklist_status_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=3), 'test_table_with_extra_data', '{"ExtraData":"TestOne"}')
  ),
  'Complete',
  'Returns Complete, when change_status is staged and validation_errors is empty'
);

-- Add validation_errors
update cif.form_change set validation_errors = '[{"error": "has error"}]' where id = 6;

select is(
  (
    select cif.project_revision_tasklist_status_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=3), 'test_table_with_extra_data', '{"ExtraData":"TestOne"}')
  ),
  'Attention Required',
  'Returns Attention Required, when change_status is staged and validation_errors is not empty'
);


-- it returns Complete when there are no form_change records for that table and that matcher
select is(
  (
    select cif.project_revision_tasklist_status_for((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=3), 'test_table_with_extra_data', '{"ExtraData":"TestThree"}')
  ),
  'Not Started',
  'Returns Not Started when there are no form_change records for that table and that matcher'
);



select finish();
rollback;
