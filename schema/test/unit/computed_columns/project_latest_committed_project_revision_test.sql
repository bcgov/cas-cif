begin;

select plan(3);

set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

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

insert into cif.project_revision(id, change_status, change_reason, project_id)
overriding system value
values
  (1, 'committed', 'reason for change', 1),
  (2, 'pending', 'reason for change', 2),
  (3, 'pending', 'reason for change', 1);


select is (
  (select id from cif.project_latest_committed_project_revision(
    (select row(project.*)::cif.project from cif.project where id=1)
  )),
  1::integer,
  'returns the latest project revision for the project when there is only one committed revision'
);

update cif.project_revision set change_status = 'committed' where id = 3;

select is (
  (select id from cif.project_latest_committed_project_revision(
    (select row(project.*)::cif.project from cif.project where id=1)
  )),
  3::integer,
  'returns the latest committed project revision for the project when there are multiple committed revisions'
);

select is (
  (select id from cif.project_latest_committed_project_revision(
    (select row(project.*)::cif.project from cif.project where id=2)
  )),
  null,
  'returns null when there is no committed project revision for the project'
);

select finish();
rollback;
