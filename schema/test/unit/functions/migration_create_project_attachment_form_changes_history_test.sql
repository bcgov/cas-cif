
begin;
select plan(9);

-- Test Setup --
truncate table cif.form_change,
  cif.project,
  cif.project_revision,
  cif.operator,
  cif.attachment,
  cif.project_attachment
restart identity cascade;

insert into cif.operator(id, legal_name) overriding system value values (1, 'Test Operator');

insert into cif.project(operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
values
  (1, 1, 1, '2000-RFP-1-123-ABCD', 'summary', 'project 1'),
  (1, 1, 1, '2000-RFP-2-123-ABCD', 'summary', 'project 2'),
  (1, 1, 1, '2000-RFP-3-123-ABCD', 'summary', 'project 3');

insert into cif.attachment (id, description, file_name, file_type, file_size) overriding system value
values
  (1, 'description1', 'file_name1', 'file_type1', 100),
  (2, 'description2', 'file_name2', 'file_type2', 200),
  (3, 'description3', 'file_name3', 'file_type3', 300),
  (4, 'description4', 'file_name4', 'file_type4', 400),
  (5, 'description5', 'file_name5', 'file_type5', 500),
  -- these attachment records are not in the project_attachment table
  (6, 'description6', 'file_name6', 'file_type6', 600),
  (7, 'description7', 'file_name7', 'file_type7', 700),
  (8, 'description8', 'file_name8', 'file_type8', 800);



insert into cif.project_attachment (project_id, attachment_id)
values
  (1, 1),
  (1, 5),
  (2, 2),
  (2, 3),
  (2, 4);

-- disable triggers to be able to insert created_at and updated_at values
alter table cif.project_revision disable trigger _100_timestamps;

insert into cif.project_revision(id, change_status, project_id, revision_type, created_at, updated_at)
overriding system value
values
-- project 1 revisions (two pending revisions)
(1, 'committed', 1, 'General Revision', '1999-01-05 09:00:00.000000-07'::timestamptz, '1999-01-07 09:00:00.000000-07'::timestamptz),
(2, 'committed', 1, 'General Revision', '1999-02-05 09:00:00.000000-07'::timestamptz, '1999-02-07 09:00:00.000000-07'::timestamptz), -- this is the revision that first project attachment form change was created
(3, 'committed', 1, 'General Revision', '1999-05-05 09:00:00.000000-07'::timestamptz, '1999-05-07 09:00:00.000000-07'::timestamptz),
(4, 'pending', 1, 'General Revision', '1999-06-05 09:00:00.000000-07'::timestamptz, '1999-06-07 09:00:00.000000-07'::timestamptz),
(5, 'pending', 1, 'Amendment', '1999-06-06 09:00:00.000000-07'::timestamptz, '1999-06-07 09:00:00.000000-07'::timestamptz),
-- project 2 revisions (all committed)
(6, 'committed', 2, 'General Revision', '1999-07-07 09:00:00.000000-07'::timestamptz, '1999-07-08 09:00:00.000000-07'::timestamptz), -- this is the revision that project attachment form change was created
(7, 'committed', 2, 'General Revision', '1999-08-07 09:00:00.000000-07'::timestamptz, '1999-08-08 09:00:00.000000-07'::timestamptz),
-- project 3 revisions (project attachment form change is on the latest revision)
(8, 'pending', 3, 'General Revision', '1999-12-07 09:00:00.000000-07'::timestamptz, '1999-12-08 09:00:00.000000-07'::timestamptz); -- this is the revision that project attachment form change was created

alter table cif.project_revision enable trigger _100_timestamps;

-- disable triggers to be able to insert created_at and updated_at values
alter table cif.form_change disable trigger _100_timestamps;

insert into cif.form_change(
new_form_data, operation,
form_data_schema_name, form_data_table_name,
form_data_record_id, project_revision_id,
change_status, json_schema_name,
created_at, updated_at
)
values
-- form change related to project 1
(
  format(
    '{"projectId": %s, "attachmentId": %s }',
    1,6
  )::jsonb,
  'create',
  'cif',
  'project_attachment',
  (select nextval(pg_get_serial_sequence('cif.project_attachment', 'id'))),
  2,
  'pending',
  'project_attachment',
  '1999-03-05 09:00:00.000000-07'::timestamptz,
  '1999-03-05 09:00:00.000000-07'::timestamptz
),
-- another form change related to project 1 but in a different revision
(
  format(
    '{"projectId": %s, "attachmentId": %s }',
    1,7
  )::jsonb,
  'create',
  'cif',
  'project_attachment',
  (select nextval(pg_get_serial_sequence('cif.project_attachment', 'id'))),
  3,
  'pending',
  'project_attachment',
  '1999-05-05 09:00:00.000000-07'::timestamptz,
  '1999-05-05 09:00:00.000000-07'::timestamptz
),
-- form change related to project 2
(
  format(
    '{"projectId": %s, "attachmentId": %s }',
    2,7
  )::jsonb,
  'create',
  'cif',
  'project_attachment',
  (select nextval(pg_get_serial_sequence('cif.project_attachment', 'id'))),
  6,
  'pending',
  'project_attachment',
  '1999-07-07 09:00:00.000000-07'::timestamptz,
  '1999-07-08 09:00:00.000000-07'::timestamptz
),
-- form change related to project 3
(
  format(
    '{"projectId": %s, "attachmentId": %s }',
    3,8
  )::jsonb,
  'create',
  'cif',
  'project_attachment',
  (select nextval(pg_get_serial_sequence('cif.project_attachment', 'id'))),
  8,
  'pending',
  'project_attachment',
  '1999-12-08 09:00:00.000000-07'::timestamptz,
  '1999-12-08 09:00:00.000000-07'::timestamptz
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
  8,
  'pending',
  'emission_intensity_reporting_requirement',
  '1999-12-08 09:00:00.000000-07'::timestamptz,
  '1999-12-08 09:00:00.000000-07'::timestamptz
);
-- End Test Setup --

select cif_private.migration_create_project_attachment_form_changes_history();

alter table cif.form_change enable trigger _100_timestamps;

-- test 1: project attachment table should have existing records + new records
select results_eq(
  $$
    select project_id, attachment_id from cif.project_attachment order by project_id, attachment_id;
  $$,
  $$
    values
    (1, 1),
    (1, 5),
    (1, 6),
    (1, 7),
    (2, 2),
    (2, 3),
    (2, 4),
    (2, 7);
  $$,
  'Returns expected project attachment records'
);

-- test 2: check form_change history for project 1
select results_eq(
  $$
    select new_form_data, operation, form_data_table_name, form_data_record_id, project_revision_id, change_status, json_schema_name, created_at, updated_at  from cif.form_change where project_revision_id in (1,2,3,4,5) and form_data_table_name = 'project_attachment' order by form_data_record_id;
  $$,
  $$
    values
    ('{"projectId": 1, "attachmentId": 6}'::jsonb, 'create'::cif.form_change_operation, 'project_attachment'::varchar, 6, 2, 'committed'::varchar,'project_attachment'::varchar,'1999-03-05 08:00:00-08'::timestamptz,'1999-03-05 08:00:00-08'::timestamptz),
    ('{"projectId": 1, "attachmentId": 6}'::jsonb, 'update'::cif.form_change_operation, 'project_attachment'::varchar, 6, 3, 'committed'::varchar,'project_attachment'::varchar,'1999-05-05 08:00:00-08'::timestamptz,'1999-05-07 08:00:00-08'::timestamptz),
    ('{"projectId": 1, "attachmentId": 6}'::jsonb, 'update'::cif.form_change_operation, 'project_attachment'::varchar, 6, 4, 'pending'::varchar,'project_attachment'::varchar,'1999-06-05 08:00:00-08'::timestamptz,'1999-06-07 08:00:00-08'::timestamptz),
    ('{"projectId": 1, "attachmentId": 6}'::jsonb, 'update'::cif.form_change_operation, 'project_attachment'::varchar, 6, 5, 'pending'::varchar,'project_attachment'::varchar,'1999-06-06 08:00:00-08'::timestamptz,'1999-06-07 08:00:00-08'::timestamptz),
    ('{"projectId": 1, "attachmentId": 7}'::jsonb, 'create'::cif.form_change_operation, 'project_attachment'::varchar, 7, 3, 'committed'::varchar,'project_attachment'::varchar,'1999-05-05 08:00:00-08'::timestamptz,'1999-05-05 08:00:00-08'::timestamptz),
    ('{"projectId": 1, "attachmentId": 7}'::jsonb, 'update'::cif.form_change_operation, 'project_attachment'::varchar, 7, 4, 'pending'::varchar,'project_attachment'::varchar,'1999-06-05 08:00:00-08'::timestamptz,'1999-06-07 08:00:00-08'::timestamptz),
    ('{"projectId": 1, "attachmentId": 7}'::jsonb, 'update'::cif.form_change_operation, 'project_attachment'::varchar, 7, 5, 'pending'::varchar,'project_attachment'::varchar,'1999-06-06 08:00:00-08'::timestamptz,'1999-06-07 08:00:00-08'::timestamptz);
  $$,
  'Returns the correct history of form changes for project 1'
);

-- test 3: check form_change history for project 2
select results_eq(
  $$
    select new_form_data, operation, form_data_table_name, form_data_record_id, project_revision_id, change_status, json_schema_name, created_at, updated_at  from cif.form_change where project_revision_id in (6,7) and form_data_table_name = 'project_attachment' order by form_data_record_id;
  $$,
  $$
    values
    ('{"projectId": 2, "attachmentId": 7}'::jsonb, 'create'::cif.form_change_operation, 'project_attachment'::varchar, 8, 6, 'committed'::varchar,'project_attachment'::varchar,'1999-07-07 08:00:00-08'::timestamptz,'1999-07-08 08:00:00-08'::timestamptz),
    ('{"projectId": 2, "attachmentId": 7}'::jsonb, 'update'::cif.form_change_operation, 'project_attachment'::varchar, 8, 7, 'committed'::varchar,'project_attachment'::varchar,'1999-08-07 08:00:00-08'::timestamptz,'1999-08-08 08:00:00-08'::timestamptz);
  $$,
  'Returns the correct history of form changes for project 2'
);

-- test 4: project 3 has only one form change in its current revision
select results_eq(
  $$
    select new_form_data, operation, form_data_table_name, form_data_record_id, project_revision_id, change_status, json_schema_name, created_at, updated_at  from cif.form_change where project_revision_id = 8 and form_data_table_name = 'project_attachment';
  $$,
  $$
    values
    ('{"projectId": 3, "attachmentId": 8}'::jsonb, 'create'::cif.form_change_operation, 'project_attachment'::varchar, 9, 8, 'pending'::varchar,'project_attachment'::varchar,'1999-12-08 08:00:00-08'::timestamptz,'1999-12-08 08:00:00-08'::timestamptz);
  $$,
  'Returns the correct history of form changes for project 3'
);

-- test 5: not touching unrelated form_change records
select results_eq(
  $$
    select new_form_data, operation, form_data_table_name, form_data_record_id, project_revision_id, change_status, json_schema_name, created_at, updated_at  from cif.form_change where project_revision_id = 8 and form_data_table_name = 'reporting_requirement';
  $$,
  $$
    values
    ('{"project_id": 1, "reportType": "TEIMP", "reportingRequirementIndex": 1}'::jsonb, 'create'::cif.form_change_operation, 'reporting_requirement'::varchar, 1, 8, 'pending'::varchar, 'emission_intensity_reporting_requirement'::varchar, '1999-12-08 08:00:00-08'::timestamptz,'1999-12-08 08:00:00-08'::timestamptz);
  $$,
  'Does not touch unrelated form_change records'
);

-- To make sure migration is idempotent
alter table cif.form_change disable trigger _100_timestamps;
select cif_private.migration_create_project_attachment_form_changes_history();
alter table cif.form_change enable trigger _100_timestamps;

-- test 6: running the migration twice should not change project_attachment records
select results_eq(
  $$
    select project_id, attachment_id from cif.project_attachment order by project_id, attachment_id;
  $$,
  $$
    values
    (1, 1),
    (1, 5),
    (1, 6),
    (1, 7),
    (2, 2),
    (2, 3),
    (2, 4),
    (2, 7);
  $$,
  'Returns the same project_attachment records after running the migration twice'
);

-- test 7: running the migration twice should not change form_change records for project 1
select results_eq(
  $$
    select new_form_data, operation, form_data_table_name, form_data_record_id, project_revision_id, change_status, json_schema_name, created_at, updated_at  from cif.form_change where project_revision_id in (1,2,3,4,5) and form_data_table_name = 'project_attachment' order by form_data_record_id;
  $$,
  $$
    values
    ('{"projectId": 1, "attachmentId": 6}'::jsonb, 'create'::cif.form_change_operation, 'project_attachment'::varchar, 6, 2, 'committed'::varchar,'project_attachment'::varchar,'1999-03-05 08:00:00-08'::timestamptz,'1999-03-05 08:00:00-08'::timestamptz),
    ('{"projectId": 1, "attachmentId": 6}'::jsonb, 'update'::cif.form_change_operation, 'project_attachment'::varchar, 6, 3, 'committed'::varchar,'project_attachment'::varchar,'1999-05-05 08:00:00-08'::timestamptz,'1999-05-07 08:00:00-08'::timestamptz),
    ('{"projectId": 1, "attachmentId": 6}'::jsonb, 'update'::cif.form_change_operation, 'project_attachment'::varchar, 6, 4, 'pending'::varchar,'project_attachment'::varchar,'1999-06-05 08:00:00-08'::timestamptz,'1999-06-07 08:00:00-08'::timestamptz),
    ('{"projectId": 1, "attachmentId": 6}'::jsonb, 'update'::cif.form_change_operation, 'project_attachment'::varchar, 6, 5, 'pending'::varchar,'project_attachment'::varchar,'1999-06-06 08:00:00-08'::timestamptz,'1999-06-07 08:00:00-08'::timestamptz),
    ('{"projectId": 1, "attachmentId": 7}'::jsonb, 'create'::cif.form_change_operation, 'project_attachment'::varchar, 7, 3, 'committed'::varchar,'project_attachment'::varchar,'1999-05-05 08:00:00-08'::timestamptz,'1999-05-05 08:00:00-08'::timestamptz),
    ('{"projectId": 1, "attachmentId": 7}'::jsonb, 'update'::cif.form_change_operation, 'project_attachment'::varchar, 7, 4, 'pending'::varchar,'project_attachment'::varchar,'1999-06-05 08:00:00-08'::timestamptz,'1999-06-07 08:00:00-08'::timestamptz),
    ('{"projectId": 1, "attachmentId": 7}'::jsonb, 'update'::cif.form_change_operation, 'project_attachment'::varchar, 7, 5, 'pending'::varchar,'project_attachment'::varchar,'1999-06-06 08:00:00-08'::timestamptz,'1999-06-07 08:00:00-08'::timestamptz);
  $$,
  'Returns the same form_change records after running the migration twice'
);

-- test 8: running the migration twice should not change form_change records for project 2
select results_eq(
  $$
    select new_form_data, operation, form_data_table_name, form_data_record_id, project_revision_id, change_status, json_schema_name, created_at, updated_at  from cif.form_change where project_revision_id in (6,7) and form_data_table_name = 'project_attachment' order by form_data_record_id;
  $$,
  $$
    values
    ('{"projectId": 2, "attachmentId": 7}'::jsonb, 'create'::cif.form_change_operation, 'project_attachment'::varchar, 8, 6, 'committed'::varchar,'project_attachment'::varchar,'1999-07-07 08:00:00-08'::timestamptz,'1999-07-08 08:00:00-08'::timestamptz),
    ('{"projectId": 2, "attachmentId": 7}'::jsonb, 'update'::cif.form_change_operation, 'project_attachment'::varchar, 8, 7, 'committed'::varchar,'project_attachment'::varchar,'1999-08-07 08:00:00-08'::timestamptz,'1999-08-08 08:00:00-08'::timestamptz);
  $$,
  'Returns the correct history of form changes for project 2'
);

-- test 9: running the migration twice should not change form_change records for project 3
select results_eq(
  $$
    select new_form_data, operation, form_data_table_name, form_data_record_id, project_revision_id, change_status, json_schema_name, created_at, updated_at  from cif.form_change where project_revision_id = 8 and form_data_table_name = 'project_attachment';
  $$,
  $$
    values
    ('{"projectId": 3, "attachmentId": 8}'::jsonb, 'create'::cif.form_change_operation, 'project_attachment'::varchar, 9, 8, 'pending'::varchar,'project_attachment'::varchar,'1999-12-08 08:00:00-08'::timestamptz,'1999-12-08 08:00:00-08'::timestamptz);
  $$,
  'Returns the correct history of form changes for project 3'
);

select finish();

rollback;
