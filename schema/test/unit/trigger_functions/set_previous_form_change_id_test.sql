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

insert into cif.project_revision(id, change_status, project_id)
overriding system value
values
  (1, 'committed', 1);


alter table cif.form_change disable trigger commit_form_change;
/** END SETUP **/


-- make sure the function exists
select has_function('cif_private', 'set_previous_form_change_id', 'Function set_previous_form_change_id should exist');

-- create an inital form_change record
insert into cif.form_change(project_revision_id, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name, change_status, change_reason)
values (
  1, 'create', 'cif', 'project', 1, 'test', 'pending', 'test_reason'
);

select results_eq(
  $$
    select previous_form_change_id from cif.form_change;
  $$,
  $$
  values (NULL::integer)
  $$,
  'Trigger does not set a previous_form_change_id for an initial form_change (has no previous form_change)'
);

-- Commit the initial form_change
update cif.form_change set change_status = 'committed';

-- Create a second form_change record for the same revision
insert into cif.form_change(project_revision_id, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name, change_status, change_reason)
values (
  1, 'create', 'cif', 'project', 2, 'test', 'pending', 'test_reason'
);

select is (
  (select previous_form_change_id from cif.form_change where id=2),
  1::integer,
  'Trigger sets the previous_form_change_id for a form_change'
);

-- Create a third form_change record for the same revision
insert into cif.form_change(project_revision_id, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name, change_status, change_reason)
values (
  1, 'create', 'cif', 'project', 2, 'test', 'pending', 'test_reason'
);

select is (
  (select previous_form_change_id from cif.form_change where id=2),
  1::integer,
  'Trigger sets the previous_form_change_id for a form_change from the latest committed form change, ignoring pending form_change records'
);

select finish();

rollback;
