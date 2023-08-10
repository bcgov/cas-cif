
begin;
select plan(4);

-- Test Setup --
truncate table cif.form_change,
  cif.project,
  cif.project_revision,
  cif.operator,
  cif.attachment,
  cif.project_attachment
restart identity cascade;

insert into cif.operator(id, legal_name) overriding system value values (1, 'Test Operator');

select cif.create_project(5);
update cif.form_change
  set new_form_data=jsonb_build_object(
      'operatorId', 1,
      'fundingStreamRfpId', 1,
      'projectStatusId', 1,
      'proposalReference', 'TESTREF-' || id,
      'summary', 'lorem ipsum dolor sit amet adipiscing eli',
      'projectName', 'Test Project',
      'totalFundingRequest', 1000000,
      'sectorName', 'Agriculture',
      'projectType', 'Carbon Capture',
      'score', 50
      )
  where form_data_table_name='project';


-- create has no previous_form_change_id and id=2
select cif.create_form_change('create', 'project_summary_report', 'cif', 'project_summary_report', '{}', 123, null, 'committed', '[]');

-- all updates have the same previous_form_change_id=2 and form_data_record_id=null (to simulate the bug that deleted form_data_record_id on commit)
select cif.create_form_change('update', 'project_summary_report', 'cif', 'project_summary_report', '{"description": "value"}', null, 1, 'pending', '[]');

select cif.create_form_change('update', 'project_summary_report', 'cif', 'project_summary_report', '{"description": "most recent"}', null, 1, 'pending', '[]');

-- mimic the commit and set previous form change id trigger
update cif.form_change set previous_form_change_id = 2, change_status='committed' where id > 2;

/** SETUP END **/

alter table cif.form_change disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

alter table cif.form_change enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;

select results_eq(
  $$
    select id, new_form_data, form_data_record_id, previous_form_change_id from cif.form_change where json_schema_name='project_summary_report' order by id asc;
  $$,
  $$
    values
    (2, '{}'::jsonb, 123, null),
    (3, '{"description": "value"}'::jsonb, 123, 2),
    (4, '{"description": "most recent"}'::jsonb, 123, 2);
  $$,
  'Running the migration should add the missing form_data_record_id'
);

-- run the test again to make sure the migration is idempotent
alter table cif.form_change disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

select cif_private.migration_rebuild_project_summary_report_history();

alter table cif.form_change enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;

select results_eq(
  $$
    select id, new_form_data, form_data_record_id, previous_form_change_id from cif.form_change where json_schema_name='project_summary_report' order by id asc;
  $$,
  $$
    values
    (2, '{}'::jsonb, 123, null),
    (3, '{"description": "value"}'::jsonb, 123, 2),
    (4, '{"description": "most recent"}'::jsonb, 123, 2);
  $$,
  'Running the migration should add the missing form_data_record_id'
);

-- set up for next test
select cif.create_form_change('create', 'project_contact', 'cif', 'project_contact', '{}', 456, null, 'committed', '[]');
select cif.create_form_change('create', 'project_summary_report', 'cif', 'project_summary_report', '{}', 489, null, 'pending', '[]');
select cif.create_form_change('create', 'project_summary_report', 'cif', 'project_summary_report', '{}', 101, null, 'committed', '[]');


select results_eq(
  $$
    select count(*) from cif.form_change where form_data_record_id=123 and id >5;
  $$,
  $$
    values(
    0::bigint
  )
  $$,
  'Doesn''t touch records with other schemas, pending records, or records that already have a form_data_record_id'
);


-- run the test again to make sure the migration is idempotent
alter table cif.form_change disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

select cif_private.migration_rebuild_project_summary_report_history();

alter table cif.form_change enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;


select results_eq(
  $$
    select count(*) from cif.form_change where form_data_record_id=123 and id >5;
  $$,
  $$
    values(
    0::bigint
  )
  $$,
  'Doesn''t touch records with other schemas, pending records, or records that already have a form_data_record_id'
);

select finish();

rollback;
