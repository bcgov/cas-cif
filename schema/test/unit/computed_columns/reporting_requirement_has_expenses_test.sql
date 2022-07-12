begin;

select plan(2);

insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values
  (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD');

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
overriding system value
values
  (1, 1, 1, 1, '000', 'summary', 'project 1');

insert into cif.reporting_requirement
  (report_due_date, comments, project_id, report_type, reporting_requirement_index) values
  ('2020-01-01', 'comment_1', 1, 'General Milestone',1),
  ('2020-01-01', 'comment_2', 1, 'Reporting Milestone',2);

select is(
  (
    select cif.reporting_requirement_has_expenses((select row(reporting_requirement.*)::cif.reporting_requirement from cif.reporting_requirement where id=1))
  ),
  true,
  'Returns true for report_type with expenses'
);

select is(
  (
    select cif.reporting_requirement_has_expenses((select row(reporting_requirement.*)::cif.reporting_requirement from cif.reporting_requirement where id=2))
  ),
  false,
  'Returns false for report_type without expenses'
);
