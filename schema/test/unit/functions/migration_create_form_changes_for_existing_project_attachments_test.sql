begin;
select plan(11);

-- Test Setup --
truncate table cif.form_change,
  cif.project,
  cif.project_revision,
  cif.operator,
  cif.attachment,
  cif.project_attachment
restart identity cascade;

insert into cif.operator (id, legal_name) overriding system value values (1, 'Test Operator');

/* Test Cases:
Project 1 (No problems, should be ignored):
- Has one committed revision
- Has a project_attachment form_change record with the proper new_form_data relating to a record in the project_attachment table
Project 2 (draft was created after bug was introduced):
- Has a committed revision and a pending draft revision
- The committed revision has no project_attachment form_change records
- The pending revision has a project_attachment form_change record with null values for new_form_data and previous_form_change_id
Project 3 (no draft revision after bug was introduced, but is missing form_change records):
- Has one committed revision
- Has no project_attachment form_change records

project_attachment table:
- Has records for all 3 projects with an associated attachment
*/

insert into cif.project (operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
values
  (1, 1, 1, '2000-RFP-1-123-ABCD', 'summary', 'project 1'),
  (1, 1, 1, '2000-RFP-2-123-ABCD', 'summary', 'project 2'),
  (1, 1, 1, '2000-RFP-3-123-ABCD', 'summary', 'project 3');

insert into cif.attachment (id, description, file_name, file_type, file_size) overriding system value
values
  (1, 'description1', 'file_name1', 'file_type1', 100),
  (2, 'description2', 'file_name2', 'file_type2', 200),
  (3, 'description3', 'file_name3', 'file_type3', 300);

insert into cif.project_attachment (project_id, attachment_id)
values
  (1, 1),
  (2, 2),
  (3, 3);

insert into cif.project_revision(id, change_status, project_id, revision_type)
overriding system value
values
-- project 1
(1, 'committed', 1, 'General Revision'),
-- project 2
(2, 'committed', 2, 'General Revision'),
(3, 'pending', 2, 'General Revision'),
-- project 3
(4, 'committed', 3, 'General Revision');


insert into cif.form_change(
new_form_data, operation,
form_data_schema_name, form_data_table_name,
form_data_record_id, project_revision_id,
change_status, json_schema_name,
previous_form_change_id
)
values
-- form change related to project 1
(
  format(
    '{"projectId": %s, "attachmentId": %s }',
    1,1
  )::jsonb,
  'update',
  'cif',
  'project_attachment',
  1,
  1,
  'committed',
  'project_attachment',
  null
),
-- form change related to project 2
(
  null,
  'update',
  'cif',
  'project_attachment',
  2,
  3,
  'pending',
  'project_attachment',
  null
),
-- unrelated form change
(
  format(
    '{"project_id": %s, "reportType": "%s", "reportingRequirementIndex": %s }',
    1,
    'TEIMP',
    1
  )::jsonb,
  'create',
  'cif',
  'reporting_requirement',
  (select nextval(pg_get_serial_sequence('cif.reporting_requirement', 'id'))),
  4,
  'pending',
  'emission_intensity_reporting_requirement',
  null
);
-- End Test Setup --

alter table cif.form_change disable trigger _100_committed_changes_are_immutable, disable trigger _set_previous_form_change_id, disable trigger _100_timestamps;

select cif_private.migration_create_form_changes_for_existing_project_attachments();

alter table cif.form_change enable trigger _100_committed_changes_are_immutable, enable trigger _set_previous_form_change_id, enable trigger _100_timestamps;
-- test 1: Project 1 form change record was not changed. It was ok to begin with.
select results_eq(
  $$
    select new_form_data, operation, form_data_table_name, form_data_record_id, project_revision_id, change_status from cif.form_change where (new_form_data->>'projectId')::int = 1;
  $$,
  $$
  values
  ('{"projectId": 1, "attachmentId": 1}'::jsonb, 'update'::cif.form_change_operation, 'project_attachment'::varchar, 1, 1, 'committed'::varchar);
  $$,
  'Project 1 form change record was not changed.'
);
-- test 2: Project 2 had a form change record created for the committed revision with the correct data
select results_eq(
  $$
    select new_form_data, operation, form_data_table_name, form_data_record_id, project_revision_id, change_status from cif.form_change where project_revision_id = 2;
  $$,
  $$
  values
  ('{"projectId": 2, "attachmentId": 2}'::jsonb, 'create'::cif.form_change_operation, 'project_attachment'::varchar, 2, 2, 'committed'::varchar);
  $$,
  'Project 2 form change record was created for the committed revision with the correct data.'
);
-- test 3: Project 2 had the form change record that existed with null data updated with the proper data for new_form_data and previous_form_change_id
select results_eq(
  $$
    select new_form_data, operation, form_data_table_name, form_data_record_id, project_revision_id, change_status, previous_form_change_id from cif.form_change where project_revision_id = 3;
  $$,
  $$
  values
  ('{"projectId": 2, "attachmentId": 2}'::jsonb, 'update'::cif.form_change_operation, 'project_attachment'::varchar, 2, 3, 'pending'::varchar, 4);
  $$,
  'Project 2 form change record was updated with the proper data for new_form_data and previous_form_change_id.'
);
-- test 4: Project 3 had a form change record created for the committed revision with the correct data
select results_eq(
  $$
    select new_form_data, operation, form_data_table_name, form_data_record_id, project_revision_id, change_status from cif.form_change where project_revision_id = 4 and form_data_table_name = 'project_attachment';
  $$,
  $$
  values
  ('{"projectId": 3, "attachmentId": 3}'::jsonb, 'create'::cif.form_change_operation, 'project_attachment'::varchar, 3, 4, 'committed'::varchar);
  $$,
  'Project 3 form change record was created for the committed revision with the correct data.'
);
-- test 5: No unrelated form change records were affected by the migration
select results_eq(
  $$
    select new_form_data, operation, form_data_table_name, form_data_record_id, project_revision_id, change_status from cif.form_change where project_revision_id = 4 and form_data_table_name = 'reporting_requirement';
  $$,
  $$
  values
  ('{"project_id": 1, "reportType": "TEIMP", "reportingRequirementIndex": 1}'::jsonb, 'create'::cif.form_change_operation, 'reporting_requirement'::varchar, 1, 4, 'pending'::varchar);
  $$,
  'No unrelated form change records were affected by the migration.'
);
-- The migration function is idempotent
alter table cif.form_change disable trigger _100_committed_changes_are_immutable, disable trigger _set_previous_form_change_id, disable trigger _100_timestamps;

select cif_private.migration_create_form_changes_for_existing_project_attachments();

alter table cif.form_change enable trigger _100_committed_changes_are_immutable, enable trigger _set_previous_form_change_id, enable trigger _100_timestamps;

-- test 6: Project 1 form change record was not changed. It was ok to begin with. (again for idempotency)
select results_eq(
  $$
    select new_form_data, operation, form_data_table_name, form_data_record_id, project_revision_id, change_status from cif.form_change where (new_form_data->>'projectId')::int = 1;
  $$,
  $$
  values
  ('{"projectId": 1, "attachmentId": 1}'::jsonb, 'update'::cif.form_change_operation, 'project_attachment'::varchar, 1, 1, 'committed'::varchar);
  $$,
  'Project 1 form change record was not changed.'
);
-- test 7: Project 2 had a form change record created for the committed revision with the correct data (again for idempotency)
select results_eq(
  $$
    select new_form_data, operation, form_data_table_name, form_data_record_id, project_revision_id, change_status from cif.form_change where project_revision_id = 2;
  $$,
  $$
  values
  ('{"projectId": 2, "attachmentId": 2}'::jsonb, 'create'::cif.form_change_operation, 'project_attachment'::varchar, 2, 2, 'committed'::varchar);
  $$,
  'Project 2 form change record was created for the committed revision with the correct data.'
);
-- test 8: Project 2 had the form change record that existed with null data updated with the proper data for new_form_data and previous_form_change_id (again for idempotency)
select results_eq(
  $$
    select new_form_data, operation, form_data_table_name, form_data_record_id, project_revision_id, change_status, previous_form_change_id from cif.form_change where project_revision_id = 3;
  $$,
  $$
  values
  ('{"projectId": 2, "attachmentId": 2}'::jsonb, 'update'::cif.form_change_operation, 'project_attachment'::varchar, 2, 3, 'pending'::varchar, 4);
  $$,
  'Project 2 form change record was updated with the proper data for new_form_data and previous_form_change_id.'
);
-- test 9: Project 3 had a form change record created for the committed revision with the correct data (again for idempotency)
select results_eq(
  $$
    select new_form_data, operation, form_data_table_name, form_data_record_id, project_revision_id, change_status from cif.form_change where project_revision_id = 4 and form_data_table_name = 'project_attachment';
  $$,
  $$
  values
  ('{"projectId": 3, "attachmentId": 3}'::jsonb, 'create'::cif.form_change_operation, 'project_attachment'::varchar, 3, 4, 'committed'::varchar);
  $$,
  'Project 3 form change record was created for the committed revision with the correct data.'
);
-- test 10: No unrelated form change records were affected by the migration (again for idempotency)
select results_eq(
  $$
    select new_form_data, operation, form_data_table_name, form_data_record_id, project_revision_id, change_status from cif.form_change where project_revision_id = 4 and form_data_table_name = 'reporting_requirement';
  $$,
  $$
  values
  ('{"project_id": 1, "reportType": "TEIMP", "reportingRequirementIndex": 1}'::jsonb, 'create'::cif.form_change_operation, 'reporting_requirement'::varchar, 1, 4, 'pending'::varchar);
  $$,
  'No unrelated form change records were affected by the migration.'
);
-- test 11: There are still the same number of rows in the project_attachment table (nothing got double committed)
select results_eq(
  $$
    select count(*) from cif.project_attachment;
  $$,
  $$
    values
    (3::bigint);
  $$,
  'There are still the same number of rows in the project_attachment table.'
);

select finish();
rollback;
