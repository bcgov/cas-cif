begin;

select plan(2);

/** TEST SETUP **/
truncate cif.form_change restart identity;

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
  (1, 'committed', 'reason for change', 1),
  (2, 'committed', 'reason for change', 1);

insert into cif.form(slug, json_schema, description) values ('schema', '{}'::jsonb, 'test description');

alter table cif.form_change disable trigger _set_initial_ancestor_form_change_ids;
insert into cif.form_change(
  new_form_data, operation, form_data_schema_name,
  form_data_table_name, json_schema_name,
  previous_form_change_id, project_revision_id,
  change_status
)
values (
  '{"testField": "test value"}',
  'create',
  'cif',
  'test_table',
  'schema',
  null,
  1,
  'committed'
),(
  null,
  'create',
  'cif',
  'other_test_table',
  'schema',
  null,
  1,
  'pending'
),(
  '{"testField": "test value"}',
  'create',
  'cif',
  'test_table',
  'schema',
  1,
  2,
  'pending'
),(
  '{"xyz": "changed value"}',
  'create',
  'cif',
  'test_table',
  'schema',
  2,
  2,
  'pending'
), (
  '{"testField": "test value"}',
  'archive',
  'cif',
  'test_table',
  'schema',
  2,
  2,
  'staged'
);

select is_empty(
  $$
    select id, change_status from cif.stage_dirty_form_changes(1) order by id
  $$,
  'Returns empty set, as no form changes are dirty'
);

select results_eq(
  $$
    select id, change_status from cif.stage_dirty_form_changes(2) order by id
  $$,
  $$
    values (4, 'staged'::varchar);
  $$,
  'Returns the newly staged form changes (3 is not dirty, 5 is already staged)'
);

select finish();
rollback;
