begin;

select plan(10);

select has_table('cif', 'funding_parameter', 'table cif.funding_parameter exists');

select columns_are(
  'cif',
  'funding_parameter',
  ARRAY[
    'id',
    'project_id',
    'max_funding_amount',
    'province_share_percentage',
    'holdback_percentage',
    'anticipated_funding_amount',
    'proponent_cost',
    'contract_start_date',
    'project_assets_life_end_date',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by'
  ],
  'columns in cif.funding_parameter match expected columns'
);

-- Test setup
truncate cif.project restart identity cascade;
truncate cif.operator restart identity cascade;

insert into cif.operator
  (legal_name, trade_name, bc_registry_id) values
  ('foo1', 'bar', '12345'),
  ('foo2', 'bar2', '54321'),
  ('foo3', 'bar3', '99999'),
  ('foo4', 'bar4', '00000'),
  ('foo5', 'bar5', '22222');

insert into cif.project(operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
values
  (1, 1, 1, '2000-RFP-1-123-ABCD', 'summary', 'project 1'),
  (2, 1, 1, '2000-RFP-1-456-ABCD', 'summary', 'project 2'),
  (3, 1, 1, '2000-RFP-1-789-ABCD', 'summary', 'project 3'),
  (4, 1, 1, '2000-RFP-1-1011-ABCD', 'summary', 'project 4'),
  (5, 1, 1, '2000-RFP-1-1213-ABCD', 'summary', 'project 5');

insert into cif.funding_parameter
  (project_id, max_funding_amount, province_share_percentage, holdback_percentage, anticipated_funding_amount, proponent_cost, contract_start_date, project_assets_life_end_date) values
  (1, 10000, 40, 10, 1000, 1000000, '2020-01-01', '2021-01-01'),
  (2, 20000, 30, 20, 2000, 2000000, '2020-01-01', '2021-01-01'),
  (3, 30000, 20, 30, 3000, 3000000, '2020-01-01', '2021-01-01'),
  (4, 40000, 10, 40, 4000, 4000000, '2020-01-01', '2021-01-01');

set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.funding_parameter
  $$,
    'cif_admin can view all data in funding_parameter table'
);

select lives_ok(
  $$
    insert into cif.funding_parameter
      (project_id, max_funding_amount, province_share_percentage, holdback_percentage, anticipated_funding_amount, proponent_cost, contract_start_date, project_assets_life_end_date) values
      (5, 50000, 50, 10, 5000, 50, '2020-01-01', '2021-01-01');
  $$,
    'cif_admin can insert data in funding_parameter table'
);

select lives_ok(
  $$
    update cif.funding_parameter set proponent_cost=510000 where project_id=5;
  $$,
    'cif_admin can change data in funding_parameter table'
);

select results_eq(
  $$
    select count(id) from cif.funding_parameter where project_id=5
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin in funding_parameter table'
);

select throws_like(
  $$
    delete from cif.funding_parameter where id=1
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table funding_parameter'
);

-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.funding_parameter
  $$,
  ARRAY['5'::bigint],
    'cif_internal can view all data from funding_parameter table'
);

select lives_ok(
  $$
    update cif.funding_parameter set proponent_cost=520000 where project_id=5;
  $$,
    'cif_internal can update data in the funding_parameter table'
);

select throws_like(
  $$
    delete from cif.funding_parameter where id=1
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from funding_parameter table'
);

select finish();

rollback;
