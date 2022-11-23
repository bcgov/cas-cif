begin;

select no_plan();

set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

insert into cif.cif_user(id, session_sub, given_name, family_name)
  overriding system value
  values (1, '11111111-1111-1111-1111-111111111111', 'Jan','Jansen'),
         (2, '22222222-2222-2222-2222-222222222222', 'Max','Mustermann'),
         (3, '33333333-3333-3333-3333-333333333333', 'Eva', 'Nováková'),
         (4, '44444444-4444-4444-4444-444444444444', 'Anna','Malli');

insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values
  (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD');

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
overriding system value
values
  (1, 1, 1, 1, '000', 'summary', 'project 1'),
  (2, 1, 1, 1, '001', 'summary', 'project 2'),
  (3, 1, 1, 1, '002', 'summary', 'project 3');

insert into cif.project_manager(project_id,
  cif_user_id,
  project_manager_label_id)

values
    (1,1,1),
    (1,2,2),
    (1,3,3),
    (1,4,4);

select is(
  (
    select cif.project_primary_managers((select row(project.*)::cif.project from cif.project where id=1)::cif.project)
  ),
  'Jan Jansen,Eva Nováková',
  'Returns a concatenated list of only primary project managers'
);

select finish();
rollback;
