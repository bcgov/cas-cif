begin;

select plan(13);

select has_table('cif', 'additional_funding_source', 'table cif.additional_funding_source exists');

select columns_are(
  'cif',
  'additional_funding_source',
  ARRAY[
    'id',
    'project_id',
    'status',
    'source',
    'amount',
    'source_index',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by'
  ],
  'columns in cif.additional_funding_source match expected columns'
);

-- Test setup
truncate cif.project restart identity cascade;
truncate cif.operator restart identity cascade;

insert into cif.operator
  (legal_name, trade_name, bc_registry_id) values
  ('foo1', 'bar', '12345');

insert into cif.project(operator_id, funding_stream_rfp_id, project_status_id, proposal_reference, summary, project_name)
values
  (1, 1, 1, '2000-RFP-1-123-ABCD', 'summary', 'project 1');

insert into cif.additional_funding_source(project_id, status, source, amount, source_index)
values
  (1, 'awaiting approval', 'source 1', 100, 1),
  (1, 'approved', 'source 2', 200, 2),
  (1, 'denied', 'source 3', 300, 3);

set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.additional_funding_source
  $$,
    'cif_admin can view all data in additional_funding_source table'
);

select lives_ok(
  $$
    insert into cif.additional_funding_source(project_id, status, source, amount, source_index) values (1, 'denied', 'source 4', 400, 4);
  $$,
    'cif_admin can insert data in additional_funding_source table'
);

select lives_ok(
  $$
    update cif.additional_funding_source set status = 'approved' where status='awaiting approval';
  $$,
    'cif_admin can change data in additional_funding_source table'
);

select results_eq(
  $$
    select count(id) from cif.additional_funding_source where status = 'approved'
  $$,
    ARRAY[2::bigint],
    'Data was changed by cif_admin'
);

select throws_like(
  $$
    delete from cif.additional_funding_source where id=1
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table additional_funding_source'
);

select throws_like(
  $$
    update cif.additional_funding_source set status = 'not existing status' where id=1;
  $$,
    'invalid input value for enum cif.additional_funding_source_status: "not existing status"'
);

select throws_like(
  $$
    insert into cif.additional_funding_source(project_id, status, source, amount, source_index) values (1, 'approved', 'source 5', 500, 4);
  $$,
    'duplicate key value violates unique constraint "additional_funding_source_project_id_unique_index"'
);


-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.additional_funding_source
  $$,
    ARRAY[4::bigint],
    'cif_internal can view all data in additional_funding_source table'
);

select lives_ok(
  $$
    update cif.additional_funding_source set status = 'approved' where status='denied';
  $$,
    'cif_internal can update data in the additional_funding_source table'
);

select results_eq(
  $$
    select count(*) from cif.additional_funding_source where id=1 and status='denied';
  $$,
    ARRAY[0::bigint],
    'Data was changed by cif_internal'
);

select throws_like(
  $$
    delete from cif.additional_funding_source where id=1
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from table additional_funding_source'
);

select finish();

rollback;
