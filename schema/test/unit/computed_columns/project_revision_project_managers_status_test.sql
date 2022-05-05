begin;

select * from no_plan();

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
  (3, 'committed', 'reason for change', 1);

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
  'project_manager',
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
  'project_manager',
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
  'project_manager',
  'schema',
  null,
  3,
  '[]'
);

/* END SETUP */

select is(
  (
    select cif.project_revision_project_managers_status((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=1))
  ),
  'Incomplete',
  'Returns Incomplete, when change_status is pending and is_pristine is null'
);

select is(
  (
    select cif.project_revision_project_managers_status((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=2))
  ),
  'Not Started',
  'Returns Not Started, when change_status is pending and is_pristine is true'
);

-- Add a form_change where is_pristine is false to revision 2
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
  -- pending, is_pristine = true
  '{"testField": "not pristine"}',
  'update',
  'pending',
  'cif',
  'project_manager',
  'schema',
  1,
  2,
  '[]'
);


select is(
  (
    select cif.project_revision_project_managers_status((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=2))
  ),
  'Incomplete',
  'Returns Incomplete, when any form_change record in a revision has a change_status of pending and is_pristine is false'
);

update cif.form_change set new_form_data = '{"testField": "test value"}' where new_form_data = '{"testField": "not pristine"}';

select is(
  (
    select cif.project_revision_project_managers_status((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=3))
  ),
  'Complete',
  'Returns Complete, when all form_change records in a revision have a change_status of staged and validation_errors is empty'
);

-- Add a form_change with validation errors to revision 3
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
  -- pending, is_pristine = true
  '{"testField": "not pristine"}',
  'update',
  'staged',
  'cif',
  'project_manager',
  'schema',
  1,
  3,
  '[{"error": "I have an error"}]'
);

select is(
  (
    select cif.project_revision_project_managers_status((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=3))
  ),
  'Attention Required',
  'Returns Attention Required, when any form_change record in a revision has a change_status of staged and validation_errors is not empty'
);

select finish();
rollback;
