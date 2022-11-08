begin;

select plan(2);

set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

insert into cif.cif_user(id, session_sub)
  overriding system value
  values (1, '11111111-1111-1111-1111-111111111111');

insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values
  (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD');

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
overriding system value
values
  (1, 1, 1, 1, '000', 'summary', 'project 1');

insert into cif.project_revision(id, change_status, change_reason, project_id)
overriding system value
values
  (1, 'committed', 'reason', 1),
  (2, 'pending', 'reason', 1);

-- Change the updated_at values for the project revisions
alter table cif.project_revision disable trigger _100_committed_changes_are_immutable;
alter table cif.project_revision disable trigger _100_timestamps;
update cif.project_revision set updated_at = '2020-09-10 15:50:07.042474-07'::timestamptz where id = 1;
update cif.project_revision set updated_at = '2021-09-12 15:50:07.042474-07'::timestamptz where id = 2;

select * from cif.project_revision where id = 1;
select is (
  (select * from cif.project_revision_effective_date(
    (select row(project_revision.*)::cif.project_revision from cif.project_revision where id=1)
  )),
  '2020-09-10 15:50:07.042474-07'::timestamptz,
  'returns updated_at if the project_revision has a change_status of committed'
);

select is (
  (select * from cif.project_revision_effective_date(
    (select row(project_revision.*)::cif.project_revision from cif.project_revision where id=2)
  )),
  null,
  'returns null if the project_revision is not yet committed'
);

select finish();
rollback;
