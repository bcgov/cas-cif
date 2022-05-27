begin;

select plan(3);

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
  (1, 'committed', 'reason for change', 1);

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
  '{"testField": "I am back"}',
  'create',
  'pending',
  'cif',
  'test_table_name',
  'schema',
  null,
  1,
  '[]'
),(
  '{"testField": "change me"}',
  'update',
  'pending',
  'cif',
  'test_table_name',
  'schema',
  1,
  1,
  '[]'
),(
  '{"testField": "test value"}',
  'update',
  'staged',
  'cif',
  'test_table_name',
  'schema',
  null,
  1,
  '[]'
),
('{"testField": "do not change me"}',
  'create',
  'pending',
  'cif',
  'test_table_name',
  'schema',
  null,
  1,
  '[]'
);


/* END SETUP */

-- we are calling the function once with an array of form_change_ids
select cif.undo_form_changes(ARRAY[2, 3]);


select is(
  (
    select new_form_data from cif.form_change
    where id = 2
  ),
  (
    select new_form_data from cif.form_change
    where id = 1
  )
  ,
  'form change with previous form change id reverts back to previous form change'
);

select is(
  (
    select new_form_data from cif.form_change
    where id = 3
  ),
  '{}'::jsonb
  ,
  'form changes with no previous form change id are set to empty json'
);

select is(
  (
    select new_form_data from cif.form_change
    where id = 4
  ),
  '{"testField": "do not change me"}'::jsonb
  ,
  'form changes did not pass to function are not changed'
);

select finish();

rollback;
