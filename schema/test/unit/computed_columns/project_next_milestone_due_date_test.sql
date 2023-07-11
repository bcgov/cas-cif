begin;
select plan(3);

/**
test cases:
start with submitted reporting requirement (no upcoming), test that that's what we get back
add an upcoming reporting requirement, test that that's what we get back (coalesce should give back this one if it exists)
add several upcoming reports, make sure we get the next one
-> use create project in create project revision functions rather than inserts

 **/
truncate table cif.cif_user cascade;
truncate cif.project restart identity cascade;
truncate table cif.funding_stream_rfp restart identity cascade;
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

/* Create mock user */
insert into cif.cif_user(id, session_sub)
  overriding system value
  values (1, '11111111-1111-1111-1111-111111111111'),
         (2, '22222222-2222-2222-2222-222222222222');

/** Create mock operator **/
insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values
  (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD'),
  (2, 'second operator legal name', 'second operator lorem ipsum dolor sit amet limited', 'BC1234567', 'EFGH'),
  (3, 'third operator legal name', 'third operator trade name', 'EF3456789', 'IJKL');

insert into cif.funding_stream(id, name, description)
overriding system value
values
(1, 'stream', 'stream description');

insert into cif.funding_stream_rfp (year, funding_stream_id) values
(2022, 1);

insert into cif.project_status (id, name, description)
overriding system value
values
(1, 'Test Status', 'Test Status Description');

/** Create mock project **/
insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
overriding system value
values
  (1, 1, 1, 1, '000', 'summary', 'project 1'),
  (2, 2, 1, 1, '001', 'summary', 'project 2'),
  (3, 3, 1, 1, '002', 'summary', 'project 3');

/** Create mock report type **/
insert into cif.report_type(name, is_milestone, has_expenses)
overriding system value
values
('Q', false, false),
('A', false, false),
('GM', true, true),
('AM', true, true),
('RM', true, false),
('T', false, false),
('PM', false, true);

/** Create mock reporting requirement **/
insert into cif.reporting_requirement(id, project_id, report_type, report_due_date, submitted_date, comments, reporting_requirement_index, description, archived_at)
overriding system value
values
(1, 1, 'GM', '2023-05-20 13:42:59.085 -0800', null, 'milestone 1', 1, 'upcoming milestone', null),
(2, 1, 'AM', '2023-01-23 13:42:59.085 -0800', null, 'milestone 2', 1, 'late milestone', null),
(3, 1, 'PM', '2023-01-16 13:42:59.085 -0800', '2023-01-06 13:42:59.085 -0800', 'milestone 3', 1, 'completed milestone', null),
(4, 2, 'A', '2023-04-15 13:42:59.085 -0800', '2023-02-15 13:42:59.085 -0800', 'milestone 4', 1, 'annual', null) ,
(5, 2, 'AM', '2023-08-05 13:42:59.085 -0800', '2023-06-11 13:42:59.085 -0800', 'milestone 5', 1, 'completed milestone', null),
(6, 2, 'GM', '2023-03-02 13:42:59.085 -0800', '2023-02-21 13:42:59.085 -0800', 'milestone 6', 1, 'completed milestone', null),
(7, 2, 'GM', '2023-09-01 13:42:59.085 -0800', '2023-04-018 13:42:59.085 -0800', 'milestone 7', 1, 'completed milestone', null),
(8, 3, 'AM', '2023-04-22 13:42:59.085 -0800', null, 'milestone 8', 1, 'upcoming milestone', null),
(9, 3, 'Q', '2023-06-15 13:42:59.085 -0800', null, 'milestone 9', 1, 'upcoming milestone', null),
(10, 3, 'GM', '2023-04-04 13:42:59.085 -0800', null, 'milestone 10', 1, 'upcoming milestone', null),
(11, 3, 'GM', '2023-04-01 13:42:59.085 -0800', null, 'milestone 10', 1, 'upcoming milestone', '2023-04-06 13:42:59.085 -0800');

select is (
  (select cif.project_next_milestone_due_date(
    (select row(project.*)::cif.project from cif.project where id=1)
  )),
  '2023-01-23 13:42:59.085 -0800'::timestamptz,
  'returns the next_due_date for project id=1 when there are two upcoming milestones with null submitted_date'
);

select is (
  (select cif.project_next_milestone_due_date(
    (select row(project.*)::cif.project from cif.project where id=2)
  )),
  '2023-09-01 13:42:59.085 -0800'::timestamptz,
  'returns the latest_submitted_date for project id=2 when there are no upcoming milestones'
);

select is (
  (select cif.project_next_milestone_due_date(
    (select row(project.*)::cif.project from cif.project where id=3)
  )),
  '2023-04-04 13:42:59.085 -0800'::timestamptz,
  'returns the next upcoming milestone due date and not considering archived reports for project id=3'
);

select finish();

rollback;
