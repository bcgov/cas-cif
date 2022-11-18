begin;

select no_plan();

set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

insert into cif.cif_user(id, session_sub, given_name, family_name)
  overriding system value
  values (1, '11111111-1111-1111-1111-111111111111', 'Jan','Jansen');
        --  (2, '22222222-2222-2222-2222-222222222222', 'Max','Mustermann');

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

insert into cif.project_manager(project_id,
  cif_user_id,
  project_manager_label_id)
values(1, 1,1);

select is(
  (
    select cif.project_primary_manager_name_includes((select row(project.*)::cif.project from cif.project where id=1), '')
  ),
  true,
  'Returns true when text is null'
);

select is(
  (
    select cif.project_primary_manager_name_includes((select row(project.*)::cif.project from cif.project where id=1), 'Jans')
  ),
  true,
  'Returns true when the text matches a project manager name'
);

select is(
  (
    select cif.project_primary_manager_name_includes((select row(project.*)::cif.project from cif.project where id=1), 'zZz')
  ),
  false,
  'Returns false when text does not match a project manager name'
);

select finish();
rollback;
