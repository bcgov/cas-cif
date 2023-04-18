begin;

select plan(4);

set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

insert into cif.cif_user(id, session_sub)
  overriding system value
  values (1, '11111111-1111-1111-1111-111111111111'),
         (2, '22222222-2222-2222-2222-222222222222');

insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values
  (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD'),
  (2, 'second operator legal name', 'second operator lorem ipsum dolor sit amet limited', 'BC1234567', 'EFGH'),
  (3, 'third operator legal name', 'third operator trade name', 'EF3456789', 'IJKL');

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
overriding system value
values
  (1, 1, 1, 1, '000', 'summary', 'project 1'),
  (2, 2, 1, 1, '001', 'summary', 'project 2'),
  (3, 3, 1, 1, '002', 'summary', 'project 3');

insert into cif.project_revision(id, revision_type, change_status, change_reason, project_id)
overriding system value
values
  (1, 'General Revision', 'committed', 'reason for change', 1),
  (2, 'General Revision', 'committed', 'reason for change', 2),
  (3, 'General Revision', 'pending', 'reason for change', 3),
  (4, 'General Revision', 'pending', 'reason for change', 1),
  (5, 'Amendment', 'pending', 'reason for change', 2);

select is (
  (select id from cif.project_pending_general_revision(
    (select row(project.*)::cif.project from cif.project where id=1)
  )),
  4::integer,
  'returns the pending general revision for the project when there is a previous committed revision'
);

select is (
  (select id from cif.project_pending_general_revision(
    (select row(project.*)::cif.project from cif.project where id=3)
  )),
  3::integer,
  'returns the pending general revision for the project when there is no previous committed revision'
);

select is (
  (select id from cif.project_pending_general_revision(
    (select row(project.*)::cif.project from cif.project where id=2)
  )),
  null,
  'returns null when there is no pending general revision for the project'
);

set jwt.claims.sub to '22222222-2222-2222-2222-222222222222';

select is (
  (select id from cif.project_pending_general_revision(
    (select row(project.*)::cif.project from cif.project where id=1)
  )),
  4,
  'returns correct id when the pending general revision was created by another user'
);

select finish();
rollback;
