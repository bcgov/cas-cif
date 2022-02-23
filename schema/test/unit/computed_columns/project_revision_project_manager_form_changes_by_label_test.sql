begin;
SET client_min_messages TO WARNING; -- don't show all the truncate messages

select plan(6);

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

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, rfp_number, summary, project_name)
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
  There are 9 form_change records in total.
  7 form_change records are for project with id = 1
  There are 3 revisions within these 7 form_change records.
  The flow is:
    Revision 1 (committed):
      create 3 records
    Revision 2 (committed):
      delete 1 record created in revision 1
      update 1 record created in revision 1
    Revision 3 (pending) - This pending revision is the main focus of the tests:
      create 1 record -> one user creates a record in form_change with id=6 another user creates a record for the same label in form_change with id=11 (concurrency check)
      delete 1 record created in revision 1
    Revision 2 (committed):
      update 1 record (same record updated in revision 2) with the exact same updated_at value. This ensures that records with identical updated_at values are ordered by id desc.
  There are 2 revisions for project with id = 2
    These are here to make sure that the function does not return any form_change records for projects outside the scope of the project_revision passed as a parameter.
    Revision 4 is committed
    Revision 5 is pending
**/

insert into cif.form_change(
  id, operation, form_data_schema_name, form_data_table_name, form_data_record_id, project_revision_id, change_reason, json_schema_name, new_form_data)
  overriding system value
  values
    (1, 'create', 'cif', 'project_manager', null, 1, 'test reason', 'project', '{"projectId": 1, "cifUserId": 1, "projectManagerLabelId": 1}'),
    (2, 'create', 'cif', 'project_manager', null, 1, 'test reason', 'project', '{"projectId": 1, "cifUserId": 2, "projectManagerLabelId": 2}'),
    (3, 'create', 'cif', 'project_manager', null, 1, 'test reason', 'project', '{"projectId": 1, "cifUserId": 3, "projectManagerLabelId": 3}'),
    (4, 'archive', 'cif', 'project_manager', 1, 2, 'test reason', 'project',null),
    (5, 'update', 'cif', 'project_manager', 2, 2, 'test reason', 'project', '{"projectId": 1, "cifUserId": 3, "projectManagerLabelId": 2}'),
    (6, 'create', 'cif', 'project_manager', null, 3, 'test reason', 'project', '{"projectId": 1, "cifUserId": 2, "projectManagerLabelId": 4}'),
    (7, 'archive', 'cif', 'project_manager', 3, 3, 'test reason', 'project', null),
    (8, 'create', 'cif', 'project_manager', null, 4, 'test reason', 'project', '{"projectId": 2, "cifUserId": 4, "projectManagerLabelId": 1}'),
    (9, 'create', 'cif', 'project_manager', null, 5, 'test reason', 'project', '{"projectId": 2, "cifUserId": 3, "projectManagerLabelId": 3}'),
    (10, 'update', 'cif', 'project_manager', 2, 6, 'test reason', 'project', '{"projectId": 1, "cifUserId": 4, "projectManagerLabelId": 2}');

set jwt.claims.sub to '00000000-0000-0000-0000-000000000001';
insert into cif.form_change(
  id, operation, form_data_schema_name, form_data_table_name, form_data_record_id, project_revision_id, change_reason, json_schema_name, new_form_data)
  overriding system value
  values
(11, 'create', 'cif', 'project_manager', null, 3, 'test reason', 'project', '{"projectId": 1, "cifUserId": 4, "projectManagerLabelId": 4}');

-- Commit Revisions 1, 2 and 4.
update cif.project_revision set change_status = 'committed' where id in (1,2,4,6);

alter table cif.form_change disable trigger _100_committed_changes_are_immutable;
alter table cif.form_change disable trigger _100_timestamps;

-- Ensure the updated_at timestamps make sense (Not all are updated at the same time, group and stagger the updates by revision)
update cif.form_change set updated_at = updated_at + interval '1 hour' where id in (1,2,3);
update cif.form_change set updated_at = updated_at + interval '2 hours' where id in (4,5,10);
update cif.form_change set updated_at = updated_at + interval '3 hours' where id in (6,7,11);
update cif.form_change set updated_at = updated_at + interval '5 hours' where id in (8,9);

-- with record as (
-- select row(project_revision.*)::cif.project_revision
--       from cif.project_revision where id=3
--     ) select (r).form_change.new_form_data from cif.project_revision_project_manager_form_changes_by_label((select * from record)) r;

/** TESTS **/

select set_eq(
  $$
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=3
    ) select label::text from cif.project_revision_project_manager_form_changes_by_label((select * from record))
  $$,
  $$
    select label::text from cif.project_manager_label
  $$,
  'Returns a distinct record for each record in the project_manager_label table'
);

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=3
    ) select (r).form_change.new_form_data from cif.project_revision_project_manager_form_changes_by_label((select * from record)) r
      where label='1 Label'
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
      where label='2 Label'
  ),
  '{"projectId": 1, "cifUserId": 4, "projectManagerLabelId": 2}'::jsonb,
  $$
    The new_form_data returned for the record with label "2 Label" matches the data that was updated in revision 6.
    (Function returns latest committed form_change record, ordered by id if records have identical updated_at values)
  $$
);

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=3
    ) select (r).form_change.new_form_data from cif.project_revision_project_manager_form_changes_by_label((select * from record)) r
      where label='3 Label'
  ),
  NULL,
  $$
    The new_form_data returned is NULL for the record with label "3 Label". It is currently being archived in revision 3
    (Function returns the pending form_change record in favor of the latest committed record)
  $$
);

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=3
    ) select (r).form_change.new_form_data from cif.project_revision_project_manager_form_changes_by_label((select * from record)) r
      where label='4 Label'
  ),
  '{"projectId": 1, "cifUserId": 4, "projectManagerLabelId": 4}'::jsonb,
  $$
    The new_form_data returned for the record with label "4 Label" matches the data that was created in revision 3 form_change id=11.
    Function returns the pending form_change with id=11 in favor of the form_change with id=3. Checks that in the case of concurrent editing, the latest pending record is returned (by updated_at, id))
  $$
);

select is(
  (
    with record as (
      select row(project_revision.*)::cif.project_revision
      from cif.project_revision where id=3
    ) select count(*) from cif.project_revision_project_manager_form_changes_by_label((select * from record)) r
      where cast((r).form_change.new_form_data->>'projectId' as integer) = 2
  ),
  0::bigint,
  'Only returns data for the project matching the project_revision''s project_id. (Does not return data from other projects)'
);

select finish();

rollback;
