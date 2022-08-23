

begin;

select plan(6);


select has_table('cif', 'project_revision', 'table cif.project_revision exists');
select columns_are(
  'cif',
  'project_revision',
  ARRAY[
'id',
'project_id',
'change_status',
'change_reason',
'is_first_revision',
'created_by',
'created_at',
'updated_by',
'updated_at',
'revision_type',
'comments'
  ],
  'columns in cif.project_revision match expected columns'
);


-- Test setup --

insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD');

insert into cif.operator(id, legal_name)
overriding system value
values (1,'test operator');

insert into cif.funding_stream(id, name, description)
overriding system value
 values (1, 'test funding stream', 'desc');

insert into cif.project(id, project_name, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary)
overriding system value
  values (1,
    'test-project',
    1,
    1,
    1,
    'rfp',
    'summary'
  );
-- insert into cif.revision_type (type)
--   values
--     ('Amendment'),
--     ('General Revision'),
--     ('Minor Revision');

-- Trigger tests --

insert into cif.change_status(status, triggers_commit) values ('testcommitted', true), ('testpending', false), ('testpending_2', false);

-- project_revision data without revision_type
insert into cif.project_revision(project_id, change_status) values
(1, 'testpending'),
(1, 'testcommitted');

-- project_revision data with revision_type
insert into cif.project_revision(project_id, change_status, revision_type) values
(2, 'testpending','Amendment'),
(3, 'testpending','Minor Revision'),

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

-- project_revision_001_add_revision_type tests

select is(
  (select count(*) from cif.project_revision where revision_type='General Revision'),
  2::bigint,
  'project_revision_001_add_revision_type adds the General Revision default revision_type to revisions that do not have a type');

select is(
  (select count(*) from cif.project_revision where revision_type=!'General Revision'),
  2::bigint,
  'project_revision_001_add_revision_type does not overwrite existing revision_type');



select finish();

rollback;
