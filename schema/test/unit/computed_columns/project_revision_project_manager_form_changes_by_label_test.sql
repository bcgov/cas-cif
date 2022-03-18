begin;
SET client_min_messages TO WARNING; -- don't show all the truncate messages

select plan(7);

/** Basic Setup: Entities needed by dependency **/

truncate table cif.cif_user restart identity cascade;
truncate table cif.project restart identity cascade;
truncate table cif.funding_stream_rfp restart identity cascade;

insert into cif.cif_user (uuid, first_name, last_name, email_address)
values
  ('00000000-0000-0000-0000-000000000000', 'user 1', 'Testuser', 'cif_internal@somemail.com'),
  ('00000000-0000-0000-0000-000000000001', 'user 2', 'Testuser', 'cif_external@somemail.com'),
  ('00000000-0000-0000-0000-000000000002', 'user 3', 'Testuser', 'cif_admin@somemail.com'),
  ('00000000-0000-0000-0000-000000000003', 'user 4', 'Testuser', 'cif@somemail.com');

set jwt.claims.sub to '00000000-0000-0000-0000-000000000000';

insert into cif.operator(id, legal_name)
  overriding system value
  values (1, 'test operator');

insert into cif.funding_stream (name, description) values ('EP', 'Emissions Performance'), ('IA', 'Innovation Accelerator');

insert into cif.funding_stream_rfp (year, funding_stream_id) values
(2022, 1);

insert into cif.change_status (status, triggers_commit, active)
values
  ('pending', false, true),
  ('committed', true, true);

  insert into cif.project_manager_label (label)
values
  ('1 Label'),
  ('2 Label'),
  ('3 Label'),
  ('4 Label');

insert into cif.project_status (name, description) values
('Test Status', 'Test Status');

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
  overriding system value
  values
    (1, 1, 1, 1, '001', 'summary', 'project 1'),
    (2, 1, 1, 1, '002', 'summary', 'project 2');

insert into cif.project_revision(id, change_status, project_id)
  overriding system value
  values (1, 'pending', 1), (2, 'pending', 1), (3, 'pending', 1), (4, 'pending', 2), (5, 'pending', 2), (6, 'pending', 1);

/** Basic Setup End **/

/**
  Create form_change records for testing.
  There are 12 form_change records in total.
  9 form_change records are for project with id = 1
  There are 3 revisions within these 10 form_change records.
  The flow is:
    Revision id=1 (committed):
      create 3 records
    Revision id=2 (committed):
      delete 1 record created in revision 1
      update 1 record created in revision 1
      (one update is an unchanged record from revision 1)
    Revision id=3 (pending) - This pending revision is the main focus of the tests:
      create 1 record
      delete 1 record
      update 1 record
  There are 2 revisions for project with id = 2
    These are here to make sure that the function does not return any form_change records for projects outside the scope of the project_revision passed as a parameter.
    Revision id=4 is committed
    Revision id=5 is pending
**/

insert into cif.form_change(
  id, operation, form_data_schema_name, form_data_table_name, form_data_record_id, project_revision_id, change_reason, json_schema_name, new_form_data)
  overriding system value
  values
    -- Create 3 records in revision 1 (committed) non-archived label ids: 1,2,3
    (1, 'create', 'cif', 'project_manager', null, 1, 'test reason', 'project', '{"projectId": 1, "cifUserId": 1, "projectManagerLabelId": 1}'),
    (2, 'create', 'cif', 'project_manager', null, 1, 'test reason', 'project', '{"projectId": 1, "cifUserId": 2, "projectManagerLabelId": 2}'),
    (3, 'create', 'cif', 'project_manager', null, 1, 'test reason', 'project', '{"projectId": 1, "cifUserId": 3, "projectManagerLabelId": 3}'),
    -- Archive a record and update a record in revision 2 (committed) non-archived label ids:: 2,3
    (4, 'archive', 'cif', 'project_manager', 1, 2, 'test reason', 'project',null),
    (5, 'update', 'cif', 'project_manager', 2, 2, 'test reason', 'project', '{"projectId": 1, "cifUserId": 4, "projectManagerLabelId": 2}'),
    (6, 'update', 'cif', 'project_manager', 3, 2, 'test reason', 'project', '{"projectId": 1, "cifUserId": 3, "projectManagerLabelId": 3}'),
    -- Create a record, update a record and archive a record in revision 3 (pending) non-archived label ids: 2,4
    (7, 'create', 'cif', 'project_manager', null, 3, 'test reason', 'project', '{"projectId": 1, "cifUserId": 2, "projectManagerLabelId": 4}'),
    (8, 'archive', 'cif', 'project_manager', 3, 3, 'test reason', 'project', null),
    (9, 'update', 'cif', 'project_manager', 2, 3, 'test reason', 'project', '{"projectId": 1, "cifUserId": 1, "projectManagerLabelId": 2}'),
    -- Create a record in a different project (committed)
    (10, 'create', 'cif', 'project_manager', null, 4, 'test reason', 'project', '{"projectId": 2, "cifUserId": 4, "projectManagerLabelId": 1}'),
    -- Create a record in a different project (pending)
    (11, 'update', 'cif', 'project_manager', null, 5, 'test reason', 'project', '{"projectId": 2, "cifUserId": 3, "projectManagerLabelId": 1}');

-- Commit / Update Revisions as user 1.
update cif.project_revision set change_status = 'committed' where id in (1,2,4);

alter table cif.form_change disable trigger _100_committed_changes_are_immutable;
alter table cif.form_change disable trigger _100_timestamps;

-- Ensure the updated_at timestamps make sense (Not all are updated at the same time, group and stagger the updates by revision)
update cif.form_change set updated_at = updated_at + interval '1 hour' where id in (1,2,3);
update cif.form_change set updated_at = updated_at + interval '2 hours' where id in (4,5,6);
update cif.form_change set updated_at = updated_at + interval '3 hours' where id in (7,8,9,10);
update cif.form_change set updated_at = updated_at + interval '4 hours' where id  = 11;

/**
  What form_change data should be returned for each manager label record in revision 3:

  1 Label: null (archived in revision 2)
  2 Label: '{"projectId": 1, "cifUserId": 1, "projectManagerLabelId": 2}' - (updated in revision 3)
  3 Label: null (archived in revision 3)
  4 Label: '{"projectId": 1, "cifUserId": 2, "projectManagerLabelId": 4}' - (created by user 2 in revision 3 AFTER user 1 created it in the same revision)

**/

/** TESTS **/

select set_eq(
  $$
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=3
    ) select (r).project_manager_label.label from cif.project_revision_project_manager_form_changes_by_label((select * from record)) r
  $$,
  $$
    select label::text from cif.project_manager_label
  $$,
  'Returns a distinct record for each record in the project_manager_label table'
);

select is(
  (
    select count(*) from cif.form_change fc
    join cif.project_revision pr
      on fc.project_revision_id = pr.id
      and pr.project_id = 1
  ),
  9::bigint,
  'There are 9 total form_change records for the project with id = 1'
);

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=3
    ) select (r).form_change.new_form_data from cif.project_revision_project_manager_form_changes_by_label((select * from record)) r
      where (r).project_manager_label.label = '1 Label'
  ),
  NULL,
  'The new_form_data returned is NULL for the record with label "1 Label". It was archived in revision 2'
);

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=3
    ) select (r).form_change.new_form_data from cif.project_revision_project_manager_form_changes_by_label((select * from record)) r
      where (r).project_manager_label.label = '2 Label'
  ),
  '{"projectId": 1, "cifUserId": 1, "projectManagerLabelId": 2}'::jsonb,
    'The new_form_data returned for the record with label "2 Label" matches the data that was updated in revision 3.'
);

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=3
    ) select (r).form_change.new_form_data from cif.project_revision_project_manager_form_changes_by_label((select * from record)) r
      where (r).project_manager_label.label = '3 Label'
  ),
  NULL,
    'The new_form_data returned is NULL for the record with label "3 Label". It is currently being archived in revision 3'
);

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=3
    ) select (r).form_change.new_form_data from cif.project_revision_project_manager_form_changes_by_label((select * from record)) r
      where (r).project_manager_label.label = '4 Label'
  ),
  '{"projectId": 1, "cifUserId": 2, "projectManagerLabelId": 4}'::jsonb,
  'The new_form_data returned for the record with label "4 Label" matches the data that was created in revision 3.'
);

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=3
    ) select count(*) from cif.project_revision_project_manager_form_changes_by_label((select * from record)) r
      where ((r).form_change.new_form_data->'projectId')::int = 2
  ),
  0::bigint,
  'Function only returns data for the project matching the project_revision''s project_id. (Does not return data from other projects)'
);

select finish();

rollback;
