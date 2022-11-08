begin;

select plan(5);

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
  (1, 'committed', 'reason for change', 1),
  (2, 'committed', 'reason for change', 1),
  (3, 'committed', 'reason for change', 1);

insert into cif.form(slug, json_schema, description) values ('schema', '{}'::jsonb, 'test description');

alter table cif.form_change disable trigger _set_previous_form_change_id;

insert into cif.form_change(new_form_data, operation, form_data_schema_name, form_data_table_name, json_schema_name, previous_form_change_id, project_revision_id)
values (
  '{"testField": "test value"}',
  'create',
  'cif',
  'test_table',
  'schema',
  null,
  1
),(
  '{"testField": "test value"}',
  'create',
  'cif',
  'test_table',
  'schema',
  1,
  2
),(
  '{"xyz": "changed value"}',
  'create',
  'cif',
  'test_table',
  'schema',
  2,
  2
), (
  '{"testField": "test value"}',
  'archive',
  'cif',
  'test_table',
  'schema',
  2,
  2
), (
  null,
  'create',
  'cif',
  'other_test_table',
  'schema',
  null,
  1
)
;

select is(
  (
    select cif.form_change_is_pristine((select row(form_change.*)::cif.form_change from cif.form_change where id=1))
  ),
  null,
  'Returns null, as form does not have a previous form id'
);

select is(
  (
    select cif.form_change_is_pristine((select row(form_change.*)::cif.form_change from cif.form_change where id=2))
  ),
  true,
  'Returns True, as previous form id has no changes'
);

select is(
  (
    select cif.form_change_is_pristine((select row(form_change.*)::cif.form_change from cif.form_change where id=3))
  ),
  false,
  'Returns false, as there are changes to the new form data'
);

select is(
  (
    select cif.form_change_is_pristine((select row(form_change.*)::cif.form_change from cif.form_change where id=4))
  ),
  false,
  'Returns false, as the form has been archived'
);

select is(
  (
    select cif.form_change_is_pristine((select row(form_change.*)::cif.form_change from cif.form_change where id=5))
  ),
  true,
  'Returns true, as the form has a null new_form_data'
);

select finish();
rollback;
