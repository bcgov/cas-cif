begin;

select plan(4);

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

insert into cif.project_revision(id, change_status, change_reason, project_id, is_first_revision)
overriding system value
values
  (1, 'committed', 'reason for change', 1, false);

alter table cif.form_change disable trigger _set_previous_form_change_id;
alter table cif.form_change disable trigger commit_form_change;

insert into cif.form_change(
  new_form_data,
  operation,
  change_status,
  form_data_schema_name,
  form_data_table_name,
  json_schema_name,
  project_revision_id)
values (
  -- Late
  format('{"reportDueDate": "%s" }', now() - interval '2 days')::jsonb,
  'create',
  'pending',
  'cif',
  'test_table_name',
  'schema',
  1
),(
  -- On track
  format('{"reportDueDate": "%s"}', now() + interval '2 days')::jsonb,
  'update',
  'pending',
  'cif',
  'test_table_name',
  'schema',
  1
),(
  -- Completed
  format('{"reportDueDate": "%s", "submittedDate": "%s"}', now() + interval '2 days', now())::jsonb,
  'update',
  'staged',
  'cif',
  'test_table_name',
  'schema',
  1
),
-- Null
('{"testField": "test value"}',
  'create',
  'pending',
  'cif',
  'test_table_with_extra_data',
  'schema',
  1
);

/* END SETUP */

select is(
  (
    select cif.form_change_reporting_requirement_status((select row(form_change.*)::cif.form_change from cif.form_change where id=1))
  ),
  'late',
  'Returns "late" when due date has passed and there is no submitted date'
);

select is(
  (
    select cif.form_change_reporting_requirement_status((select row(form_change.*)::cif.form_change from cif.form_change where id=2))
  ),
  'onTrack',
  'Returns "onTrack" when due date has not yet passed and there is no submitted date'
);

select is(
  (
    select cif.form_change_reporting_requirement_status((select row(form_change.*)::cif.form_change from cif.form_change where id=3))
  ),
  'completed',
  'Returns "completed" when a due date and a submitted date exist'
);

select is(
  (
    select cif.form_change_reporting_requirement_status((select row(form_change.*)::cif.form_change from cif.form_change where id=4))
  ),
  null,
  'Returns null when there is no due date'
);

select finish();
rollback;
