

begin;

select plan(7);

select has_table('cif', 'project_revision', 'table cif.project_revision exists');


-- Test setup --
insert into cif.operator(legal_name) values ('test operator');
insert into cif.funding_stream(name, description) values ('test funding stream', 'desc');
insert into cif.project(project_name, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary)
  values (
    'test-project',
    (select id from cif.operator limit 1),
    (select id from cif.funding_stream_rfp limit 1),
    (select id from cif.project_status limit 1),
    'rfp',
    'summary'
  );


-- Trigger tests --

insert into cif.change_status(status, triggers_commit) values ('testcommitted', true), ('testpending', false), ('testpending_2', false);
insert into cif.project_revision(project_id, change_status) values ((select id from cif.project limit 1), 'testpending'), ((select id from cif.project limit 1), 'testcommitted');

select lives_ok(
  $$
    update cif.project_revision set change_status = 'testpending_2' where change_status='testpending'
  $$,
  'allows update if the change status is pending'
);

select throws_ok(
  $$
    update cif.project_revision set change_status = 'testpending_2' where change_status='testcommitted'
  $$,
  'Committed records cannot be modified',
  'prevents update if the change status is committed'
);

select throws_ok(
  $$
    delete from cif.project_revision where change_status='testcommitted'
  $$,
  'Committed records cannot be modified',
  'prevents delete if the change status is committed'
);

-- test project_revision_001_add_revision_type
truncate table cif.project_revision, cif.project cascade;

-- use the contents of the revert file to set the database to a state where revision_type isn't required
alter table cif.project_revision drop column revision_type, drop column comments;

select columns_are(
  'cif',
  'project_revision',
  ARRAY[
    'id',
    'project_id',
    'change_status',
    'change_reason',
    'is_first_revision',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'revision_status'
  ],
  'revision_type and comments column were reverted and do not exist in cif.project_revision'
);

insert into cif.project(id, project_name, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary)
overriding system value
  values (
    1,'test-project-333',
    (select id from cif.operator limit 1),
    (select id from cif.funding_stream_rfp limit 1),
    (select id from cif.project_status limit 1),
    'rfp333',
    'summary333'
  ),
  (
    2,'test-project-444',
    (select id from cif.operator limit 1),
    (select id from cif.funding_stream_rfp limit 1),
    (select id from cif.project_status limit 1),
    'rfp444',
    'summary444'
  );

insert into cif.project_revision(project_id)
values
  (1),
  (2);

-- deploy the project_revision_001_add_revision_type migration
alter table cif.project_revision disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

alter table cif.project_revision
add column revision_type varchar(1000) not null references cif.revision_type(type) default 'General Revision',
add column comments varchar(10000);

alter table cif.project_revision enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;


select columns_are(
  'cif',
  'project_revision',
  ARRAY[
    'id',
    'project_id',
    'change_status',
    'change_reason',
    'is_first_revision',
    'comments',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'revision_type',
    'revision_status'
  ],
  'columns in cif.project_revision match expected columns after migration project_revision_001_add_revision_type'
);


select is(
  (select count(*) from cif.project_revision where revision_type='General Revision'),
  2::bigint,
  'project_revision_001_add_revision_type adds the General Revision default revision_type to revisions that do not have a type');


-- deploy project_revision_002_set_revision_statuses
alter table cif.project_revision disable trigger _100_committed_changes_are_immutable, disable trigger _100_timestamps;

alter table cif.project_revision alter column revision_status set default 'Draft';

update cif.project_revision
set revision_status =
(case
      when
        (change_status='pending') or
        (change_status='staged')
        then 'Draft'
    else 'Applied'
    end);

alter table cif.project_revision enable trigger _100_committed_changes_are_immutable, enable trigger _100_timestamps;


select finish();

rollback;
