begin;

select plan(7);

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

insert into cif.project_revision(id, change_status, change_reason, project_id)
overriding system value
values
  (1, 'committed', 'reason for change', 1);

insert into cif.form(slug, json_schema, description) values ('schema', '{}'::jsonb, 'test description');

alter table cif.form_change disable trigger _set_initial_ancestor_form_change_ids;
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
  'create',
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
),(
  '{"fundingStreamRfpId": 3}',
  'update',
  'staged',
  'cif',
  'project',
  'schema',
  null,
  1,
  '[]'
);


/* END SETUP */

-- we are calling the function once with an array of form_change_ids
select cif.undo_form_changes(ARRAY[2, 3, 5, 6]);

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
    select operation from cif.form_change
    where id =2
  ),
  'update'
  ,
  'form change with previous form change id have operation reverted to update'
);

select is(
  (
    select new_form_data from cif.form_change
    where id = 6
  ),
  '{"fundingStreamRfpId": 3}'::jsonb
  ,
  'project form changes with no previous form change id keep their fundingStreamRfpId'
);

select is(
  (
    select new_form_data from cif.form_change
    where id = 3
  ),
  null
  ,
  'non project form changes with no previous form change id are deleted'
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

select is(
  (
    select new_form_data from cif.form_change
    where id = 5
  ),
  null
  ,
  'form changes with no previous form change id are set to null when form_data_table name is not project'
);

select results_eq(
  $$
    select (ufc).id from cif.undo_form_changes(ARRAY[2]) ufc
  $$,
  $$
    select id from cif.project_revision where id = 1
  $$,
  'Returns project revision on calling undo_form_changes'
);

select finish();

rollback;
