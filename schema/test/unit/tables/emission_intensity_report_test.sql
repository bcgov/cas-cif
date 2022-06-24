begin;

select plan(11);

select has_table('cif', 'emission_intensity_report', 'table cif.emission_intensity_report exists');


-- Test setup
truncate cif.project restart identity cascade;
truncate cif.operator restart identity cascade;

insert into cif.operator
  (legal_name, trade_name, bc_registry_id) values
  ('foo1', 'bar', '12345');

insert into cif.project(operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
values
  (1, 1, 1, '2000-RFP-1-123-ABCD', 'summary', 'project 1');

insert into cif.reporting_requirement
  (report_due_date, comments, certified_by, certified_by_professional_designation, project_id, report_type, reporting_requirement_index) values
  ('2020-01-01', 'comment_1', 'certifier_1', 'certifier_1', 1, 'Annual',1);

insert into cif.emission_intensity_report(
  reporting_requirement_id,
  measurement_period_start_date,
  measurement_period_end_date,
  emission_functional_unit,
  production_functional_unit,
  baseline_emission_intensity,
  target_emission_intensity,
  post_project_emission_intensity,
  total_lifetime_emission_reduction,
  adjusted_emissions_intensity_performance
) values (
  1,
  now(),
  now() + interval '150 days',
  'tCO2e',
  'GJ',
  1,
  2,
  3,
  4,
  5
);


set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.emission_intensity_report
  $$,
    'cif_admin can view all data in emission_intensity_report table'
);

select lives_ok(
  $$
    insert into cif.emission_intensity_report(
  reporting_requirement_id,
  measurement_period_start_date,
  measurement_period_end_date,
  emission_functional_unit,
  production_functional_unit,
  baseline_emission_intensity,
  target_emission_intensity,
  post_project_emission_intensity,
  total_lifetime_emission_reduction,
  adjusted_emissions_intensity_performance
) values (
  1,
  now(),
  now() + interval '150 days',
  'test-unit',
  'GJ',
  1,
  2,
  3,
  4,
  5
);
  $$,
    'cif_admin can insert data in emission_intensity_report table'
);

select lives_ok(
  $$
    update cif.emission_intensity_report set emission_functional_unit='changed by admin' where emission_functional_unit = 'test-unit';
  $$,
    'cif_admin can change data in emission_intensity_report table'
);

select results_eq(
  $$
    select count(id) from cif.emission_intensity_report where emission_functional_unit = 'changed by admin'
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin in emission_intensity_report table'
);

select throws_like(
  $$
    delete from cif.emission_intensity_report where id=1
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table emission_intensity_report'
);


-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.emission_intensity_report
  $$,
  ARRAY['2'::bigint],
    'cif_internal can view all data from emission_intensity_report table'
);

select lives_ok(
  $$
    select * from cif.emission_intensity_report
  $$,
    'cif_admin can view all data in emission_intensity_report table'
);

select lives_ok(
  $$
    insert into cif.emission_intensity_report(
    reporting_requirement_id,
    measurement_period_start_date,
    measurement_period_end_date,
    emission_functional_unit,
    production_functional_unit,
    baseline_emission_intensity,
    target_emission_intensity,
    post_project_emission_intensity,
    total_lifetime_emission_reduction,
    adjusted_emissions_intensity_performance
    ) values (
      1,
      now(),
      now() + interval '150 days',
      'test-unit',
      'GJ',
      1,
      2,
      3,
      4,
      5
    );
  $$,
    'cif_internal can insert data in emission_intensity_report table'
);

select lives_ok(
  $$
    update cif.emission_intensity_report set emission_functional_unit = 'changed_by_internal' where emission_functional_unit='test-unit';
  $$,
    'cif_internal can update data in the emission_intensity_report table'
);

select throws_like(
  $$
    delete from cif.emission_intensity_report where id=1
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from emission_intensity_report table'
);

select finish();

rollback;
