

begin;

select plan(3);

-- Test setup --
insert into cif.operator(legal_name) values ('test operator');
insert into cif.funding_stream(name, description) values ('test funding stream', 'desc');
insert into cif.project(project_name, operator_id, funding_stream_rfp_id, project_status_id, rfp_number, summary)
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

select finish();

rollback;
