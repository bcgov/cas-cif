

begin;

select plan(5);

insert into cif.operator (id, legal_name, trade_name, bc_registry_id, operator_code)
overriding system value
values (1, 'first operator legal name', 'first operator trade name', 'AB1234567', 'ABCD');

insert into cif.project(id, operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
overriding system value
values (1, 1, 1, 1, '000', 'summary', 'project 1');

insert into cif.reporting_requirement(id,report_due_date, comments, project_id, report_type, reporting_requirement_index)
overriding system value
values (1, '2020-01-01', 'comment_1', 1, 'General Milestone', 1);


insert into cif.emission_intensity_report(id, reporting_requirement_id, baseline_emission_intensity, target_emission_intensity, post_project_emission_intensity) overriding system value
  values (1, 1, 1, 2, 3), (2, 1, null, 2, 3), (3, 1, 1, null, 3), (4, 1, 1, 2, null);


select is(
  (
    select cif.emission_intensity_report_calculated_ei_performance((select row(emission_intensity_report.*)::cif.emission_intensity_report from cif.emission_intensity_report where id=1))
  ),
  200.00,
  'Returns the the calculated EI performance when all required values exist'
);

select is(
  (
    select cif.emission_intensity_report_calculated_ei_performance((select row(emission_intensity_report.*)::cif.emission_intensity_report from cif.emission_intensity_report where id=2))
  ),
  null,
  'Returns null when baseline_emission_intensity is null but all other values exist'
);

select is(
  (
    select cif.emission_intensity_report_calculated_ei_performance((select row(emission_intensity_report.*)::cif.emission_intensity_report from cif.emission_intensity_report where id=3))
  ),
  null,
  'Returns null when target_emission_intensity is null but all other values exist'
);

select is(
  (
    select cif.emission_intensity_report_calculated_ei_performance((select row(emission_intensity_report.*)::cif.emission_intensity_report from cif.emission_intensity_report where id=4))
  ),
  null,
  'Returns null when post_project_emission_intensity is null but all other values exist'
);

select is(
  (
    select cif.emission_intensity_report_calculated_ei_performance((select row(emission_intensity_report.*)::cif.emission_intensity_report from cif.emission_intensity_report where id=5))
  ),
  null,
  'Returns null when baseline_intensity_emission and target_emission_intensity are equal (woud produce division by 0)'
);

select finish();
rollback;
