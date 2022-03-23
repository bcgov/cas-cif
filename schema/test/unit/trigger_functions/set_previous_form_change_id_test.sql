begin;

select plan(5);

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
  (1, 1, 1, 1, '000', 'summary', 'project 1'),
  (2, 1, 1, 1, '001', 'summary', 'project 2');

insert into cif.project_revision(id, change_status, project_id)
overriding system value
values
  (1, 'committed', 1), (2, 'committed', 1), (3, 'committed', 1), (4, 'committed', 2);

alter table cif.form_change disable trigger commit_form_change;
/** END SETUP **/


-- make sure the function exists
select has_function('cif_private', 'set_previous_form_change_id', 'Function set_previous_form_change_id should exist');

-- create an inital form_change record
insert into cif.form_change(project_revision_id, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name, change_status, change_reason)
values
  (1, 'create', 'cif', 'project', 1, 'test', 'pending', 'test_project_form_change'),
  (2, 'create', 'cif', 'project_manager', 1, 'test', 'pending', 'test_proect_manager_form_change'),
  (3, 'create', 'cif', 'contact', 1, 'test', 'pending', 'test_contact_form_change');

select results_eq(
  $$
    select previous_form_change_id from cif.form_change;
  $$,
  $$
  values (NULL::integer), (NULL::integer), (NULL::integer);
  $$,
  'Trigger does not set a previous_form_change_id for an initial form_change (has no previous form_change)'
);

-- Commit the initial form_change
update cif.form_change set change_status = 'committed';

-- Create a set of pending form_change records for the same revision
insert into cif.form_change(project_revision_id, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name, change_status, change_reason)
values
  (1, 'create', 'cif', 'project', 1, 'test', 'pending', 'first_pending_project'),
  (1, 'create', 'cif', 'project_manager', 1, 'test', 'pending', 'first_pending_project_manager'),
  (1, 'create', 'cif', 'contact', 1, 'test', 'pending', 'first_pending_contact');

select is (
  (select previous_form_change_id from cif.form_change where change_reason='first_pending_project'),
  (select id from cif.form_change where change_reason='test_project_form_change'),
  'Trigger sets the correct previous_form_change_id for a form_change'
);

-- Create a second set of pending form_change records for the same revision
insert into cif.form_change(project_revision_id, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name, change_status, change_reason)
values
  (1, 'create', 'cif', 'project', 1, 'test', 'pending', 'second_pending_project'),
  (1, 'create', 'cif', 'project_manager', 1, 'test', 'pending', 'second_pending_project_manager'),
  (1, 'create', 'cif', 'contact', 1, 'test', 'pending', 'second_pending_contact');

select is (
  (select previous_form_change_id from cif.form_change where change_reason='second_pending_project'),
  (select id from cif.form_change where change_reason='test_project_form_change'),
  'Trigger sets the correct previous_form_change_id for a form_change from the latest committed form change, ignoring pending form_change records'
);

alter table cif.form_change disable trigger _100_timestamps;
-- commit the second set of pending form_change records at different times to test that commit order matters
update cif.form_change set change_status = 'committed', updated_at=now() where change_reason ilike 'second_pending%';
update cif.form_change set change_status = 'committed', updated_at=now() + interval '1 hour' where change_reason ilike 'first_pending%';

alter table cif.form_change enable trigger _100_timestamps;

-- Create a set of form_change records for a new revision
insert into cif.form_change(project_revision_id, operation, form_data_schema_name, form_data_table_name, form_data_record_id, json_schema_name, change_status, change_reason)
values
  (2, 'update', 'cif', 'project', 1, 'test', 'pending', 'new_project_form_change_revision_2'),
  (2, 'update', 'cif', 'project_manager', 1, 'test', 'pending', 'new_project_manager_form_change_revision_2'),
  (2, 'update', 'cif', 'contact', 1, 'test', 'pending', 'new_contact_form_change_revision_2');;

select is (
  (select previous_form_change_id from cif.form_change where change_reason='new_project_form_change_revision_2'),
  (select id from cif.form_change where change_reason='first_pending_project'),
  'Trigger sets the correct previous_form_change_id for the first form_change in a new revision, using the latest committed form_change'
);

select finish();

rollback;
