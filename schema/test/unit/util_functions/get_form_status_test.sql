

begin;

select * from no_plan();

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
  (1, 1, 1, 1, '000', 'summary', 'project 1'), (2, 1, 1, 1, '001', 'summary', 'project 2');

insert into cif.project_revision(id, change_status, change_reason, project_id)
overriding system value
values
  (1, 'pending', 'reason for change', 1),
  (2, 'staged', 'reason for change', 2);

insert into cif.form_change(id, change_status, new_form_data, operation, form_data_schema_name, form_data_table_name, json_schema_name, validation_errors, previous_form_change_id, project_revision_id)
overriding system value
values (
    1,
    'pending',
  '{}',
  'create',
  'cif',
  'project',
  'schema',
  '[]',
  null,
  1
),(
    2,
    'pending',
  '{"testField": "test value"}',
  'create',
  'cif',
  'test_table',
  'schema',
  '[]',
  null,
  2
);
-- ,(
--     3,
--     'staged',
--   '{"testField": "updated test value"}',
--   'create',
--   'cif',
--   'test_table',
--   'schema',
--   '[]',
--   2,
--   2
-- );


--
select is((select cif.get_form_status(1, 'project')), 'Not Started');
select is((select cif.get_form_status(2, 'test_table')), 'In Progress');
-- select is((select cif.get_form_status('3', 'test_table')), 'Filled');


select finish();

rollback;
