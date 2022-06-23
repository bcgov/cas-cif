begin;

select plan(10);

select has_table('cif', 'payment', 'table cif.payment exists');

select columns_are(
  'cif',
  'payment',
  ARRAY[
    'id',
    'reporting_requirement_id',
    'gross_amount',
    'net_amount',
    'date_sent_to_csnr',
    'reporting_requirement_id',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by'
  ],
  'columns in cif.payment match expected columns'
);

-- Test setup
truncate cif.project restart identity cascade;
truncate cif.operator restart identity cascade;
truncate cif.reporting_requirement restart identity cascade;

insert into cif.operator
  (legal_name, trade_name, bc_registry_id) values
  ('foo1', 'bar', '12345');

insert into cif.project(operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
values
  (1, 1, 1, '2000-RFP-1-123-ABCD', 'summary', 'project 1');

insert into cif.reporting_requirement
  (report_due_date, comment, project_id, report_type, reporting_requirement_index)
  values ('2020-01-01', 'comment_1', 1, 'Annual', 1);


insert into cif.payment (gross_amount, net_amount, date_sent_to_csnr, reporting_requirement_id)
values
  (100, 50, '2020-01-01', 1),
  (200, 100, '2021-01-01', 1),
  (300, 150, '2022-01-01', 1);


set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

select * from cif.payment;

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.payment
  $$,
    'cif_admin can view all data in payment table'
);

select lives_ok(
  $$
    insert into cif.payment (gross_amount, net_amount, date_sent_to_csnr, reporting_requirement_id)
    values (400, 200, '2023-01-01', 1);
  $$,
    'cif_admin can insert data in payment table'
);

select lives_ok(
  $$
    update cif.payment set gross_amount = 500 where gross_amount = 400;
  $$,
    'cif_admin can change data in payment table'
);

select results_eq(
  $$
    select count(id) from cif.payment where gross_amount = 500
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin in payment table'
);


select throws_like(
  $$
    delete from cif.payment where id=1
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table payment'
);

-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.payment
  $$,
  ARRAY[4::bigint],
    'cif_internal can view all data from payment table'
);

select lives_ok(
  $$
    update cif.payment set gross_amount = 600 where gross_amount = 500;
  $$,
    'cif_internal can update data in the payment table'
);

select throws_like(
  $$
    delete from cif.payment where id=1
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from payment table'
);

select finish();

rollback;
