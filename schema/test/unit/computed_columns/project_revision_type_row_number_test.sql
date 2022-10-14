begin;

select plan(5);

/** SETUP **/
truncate cif.project restart identity cascade;
truncate cif.operator restart identity cascade;

insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values
  (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD');

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
overriding system value
values
  (1, 1, 1, 1, '000', 'summary', 'project 1');

insert into cif.project_revision(
project_id,
revision_type,
change_status
)
values
(1, 'Amendment', 'committed'),
(1, 'General Revision', 'committed'),
(1, 'Amendment', 'committed'),
(1, 'Minor Revision', 'committed'),
(1, 'Amendment', 'committed'),
(1, 'Minor Revision', 'committed'),
(1, 'Minor Revision', 'committed'),
(1, 'General Revision', 'committed'),
(1, 'Minor Revision', 'committed');
/** END SETUP **/


select is(
  (
    select cif.project_revision_type_row_number((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=1))
  ),
  1,
  'Returns 1 as the row number of the project revision with amendment type within the scope of a project and among all other revisions of the same type.'
);

select is(
  (
    select cif.project_revision_type_row_number((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=3))
  ),
  2,
  'Returns 2 as the row number of the project revision with amendment type within the scope of a project and among all other revisions of the same type.'
);


select is(
  (
    select cif.project_revision_type_row_number((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=4))
  ),
  1,
  'Returns 1 as the row number of the project revision with minor revision type within the scope of a project and among all other revisions of the same type.'
);

select is(
  (
    select cif.project_revision_type_row_number((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=6))
  ),
  2,
  'Returns 2 as the row number of the project revision with minor revision type within the scope of a project and among all other revisions of the same type.'
);

select is(
  (
    select cif.project_revision_type_row_number((select row(project_revision.*)::cif.project_revision from cif.project_revision where id=9))
  ),
  4,
  'Returns 4 as the row number of the project revision with minor revision within the scope of a project and among all other revisions of the same type.'
);
rollback;
