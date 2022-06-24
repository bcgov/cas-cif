begin;

select plan(11);

select has_table('cif', 'milestone_report', 'table cif.milestone_report exists');


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

insert into cif.milestone_report(
  reporting_requirement_id,
  substantial_completion_date,
  certified_by,
  certifier_professional_designation,
  total_eligible_expenses
) values (
  1,
  now() + interval '30 days',
  'Tom',
  'Professional Cat',
  1234.56
);


set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.milestone_report
  $$,
    'cif_admin can view all data in milestone_report table'
);

select lives_ok(
  $$
    insert into cif.milestone_report(
      reporting_requirement_id,
      substantial_completion_date,
      certified_by,
      certifier_professional_designation,
      total_eligible_expenses
    ) values (
      1,
      now() + interval '30 days',
      'Jerry',
      'Professional Mouse',
      1234.56
    );
  $$,
    'cif_admin can insert data in milestone_report table'
);

select lives_ok(
  $$
    update cif.milestone_report set total_eligible_expenses = 123.45 where certified_by = 'Jerry';
  $$,
    'cif_admin can change data in milestone_report table'
);

select results_eq(
  $$
    select count(id) from cif.milestone_report where total_eligible_expenses = 123.45
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin in milestone_report table'
);

select throws_like(
  $$
    delete from cif.milestone_report where id=1
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table milestone_report'
);


-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.milestone_report
  $$,
  ARRAY['2'::bigint],
    'cif_internal can view all data from milestone_report table'
);

select lives_ok(
  $$
    select * from cif.milestone_report
  $$,
    'cif_admin can view all data in milestone_report table'
);

select lives_ok(
  $$
    insert into cif.milestone_report(
      reporting_requirement_id,
      substantial_completion_date,
      certified_by,
      certifier_professional_designation,
      total_eligible_expenses
    ) values (
      1,
      now() + interval '30 days',
      'Tweety',
      'Professional Bird',
      1234.56
    );
  $$,
    'cif_admin can insert data in milestone_report table'
);

select lives_ok(
  $$
    update cif.milestone_report set total_eligible_expenses = 123.45 where certified_by = 'Tweety';
  $$,
    'cif_internal can update data in the milestone_report table'
);

select throws_like(
  $$
    delete from cif.milestone_report where id=1
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from milestone_report table'
);

select finish();

rollback;
