begin;

select plan(1);

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
(1, 'General Revision', 'committed'),
(1, 'Amendment', 'committed'),
(1, 'General Revision', 'committed'),
(1, 'General Revision', 'committed'),
(1, 'General Revision', 'committed'),
(1, 'General Revision', 'committed');
/** END SETUP **/

select results_eq(
  $$
    select id, cif.project_revision_type_row_number(row(project_revision.*)::cif.project_revision) from cif.project_revision;
  $$,
  $$
    values
    (1, 1),
    (2, 1),
    (3, 2),
    (4, 2),
    (5, 3),
    (6, 3),
    (7, 4),
    (8, 5),
    (9, 6)
  $$,
  'Returns currosponding row number for each project revision based on revision type'
);
rollback;
