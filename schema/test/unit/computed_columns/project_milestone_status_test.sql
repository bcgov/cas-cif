begin;
select plan(4);

truncate cif.operator restart identity cascade;
truncate cif.project restart identity cascade;
truncate cif.project_revision restart identity cascade;
truncate cif.form_change restart identity cascade;
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';


/** Create mock operator **/
insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values
  (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD'),
  (2, 'second operator legal name', 'second operator lorem ipsum dolor sit amet limited', 'BC1234567', 'EFGH'),
  (3, 'third operator legal name', 'third operator trade name', 'EF3456789', 'IJKL');

/** Create mock project **/
insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
overriding system value
values
  (1, 1, 1, 1, '000', 'summary', 'project 1'),
  (2, 2, 1, 1, '001', 'summary', 'project 2'),
  (3, 3, 1, 1, '002', 'summary', 'project 3');


/** Create mock reporting requirement **/
insert into cif.reporting_requirement(id, project_id, report_type, report_due_date, submitted_date, comments, reporting_requirement_index, description, archived_at)
overriding system value
values
-- project 1, id=2 is late
(1, 1, 'General Milestone', current_date + interval '1 day', null, 'milestone 1', 1, 'upcoming milestone', null),
(2, 1, 'General Milestone', '1999-01-23 13:42:59.085 -0800', null, 'milestone 2', 1, 'late milestone', null),
(3, 1, 'General Milestone', '2023-01-16 13:42:59.085 -0800', '2023-01-06 13:42:59.085 -0800', 'milestone 3', 1, 'completed milestone', null),
-- project 2, all milestones complete
(4, 2, 'General Milestone', '2023-04-15 13:42:59.085 -0800', '2023-02-15 13:42:59.085 -0800', 'milestone 4', 1, 'completed milestone', null) ,
(5, 2, 'General Milestone', '2023-08-05 13:42:59.085 -0800', '2023-06-11 13:42:59.085 -0800', 'milestone 5', 1, 'completed milestone', null),
(6, 2, 'General Milestone', '2023-03-02 13:42:59.085 -0800', '2023-02-21 13:42:59.085 -0800', 'milestone 6', 1, 'completed milestone', null),
(7, 2, 'General Milestone', '2023-04-15 13:42:59.085 -0800', '2023-04-18 13:42:59.085 -0800', 'milestone 7', 1, 'completed milestone', null),
-- project 3, all milestones upcoming, id=11 checks for a same-day due date
(8, 3, 'General Milestone', now() + interval '1 day', null, 'milestone 8', 1, 'upcoming milestone', null),
(9, 3, 'General Milestone', now() + interval '1 day', null, 'milestone 9', 1, 'upcoming milestone', null),
(10, 3, 'General Milestone', now() + interval '1 day', null, 'milestone 10', 1, 'upcoming milestone', null),
(11, 3, 'General Milestone', now(), null, 'milestone 10', 1, 'upcoming milestone', '2023-04-06 13:42:59.085 -0800');

select is(
  (
    select cif.project_milestone_status((select row(project.*)::cif.project from cif.project where id=123))
  ),
  (
    'none'
  ),
  'Returns none when there are no milestones'
);

select is(
  (
    select cif.project_milestone_status((select row(project.*)::cif.project from cif.project where id=1))
  ),
  (
    'late'
  ),
  'Returns late when a milestone is overdue'
);

select is(
  (
    select cif.project_milestone_status((select row(project.*)::cif.project from cif.project where id=3))
  ),
  (
    'on track'
  ),
  'Returns onTrack when no milestones are overdue'
);

select is(
  (
    select cif.project_milestone_status((select row(project.*)::cif.project from cif.project where id=2))
  ),
  (
    'complete'
  ),
  'Returns complete when all milestones are complete'
);


select finish();

rollback;
