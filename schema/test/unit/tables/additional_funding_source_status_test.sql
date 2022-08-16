begin;

select plan(11);

select has_table('cif', 'additional_funding_source_status', 'table cif.additional_funding_source_status exists');

select columns_are(
  'cif',
  'additional_funding_source_status',
  ARRAY[
    'status_name',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by'
  ],
  'columns in cif.additional_funding_source_status match expected columns'
);

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select is(
  (select count(*) from cif.additional_funding_source_status),
  3::bigint,
    'cif_admin can view all data in additional_funding_source_status table'
);

select lives_ok(
  $$
    insert into cif.additional_funding_source_status (status_name) values ('Test Status');
  $$,
    'cif_admin can insert data in additional_funding_source_status table'
);

select lives_ok(
  $$
    update cif.additional_funding_source_status set status_name='changed by admin' where status_name='Test Status';
  $$,
    'cif_admin can change data in additional_funding_source_status table'
);

select results_eq(
  $$
    select count(status_name) from cif.additional_funding_source_status where status_name= 'changed by admin'
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin'
);

select throws_like(
  $$
    delete from cif.additional_funding_source_status where status_name='changed by admin';
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table additional_funding_source_status'
);

-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.additional_funding_source_status
  $$,
  ARRAY['4'::bigint],
    'cif_internal can view all data from additional_funding_source_status table'
);

select lives_ok(
  $$
    insert into cif.additional_funding_source_status (status_name) values ('Test Status 2');
  $$,
    'cif_admin can insert data in additional_funding_source_status table'
);

select lives_ok(
  $$
    update cif.additional_funding_source_status set status_name= 'changed by internal' where status_name='changed by admin';
  $$,
    'cif_internal can update data in the additional_funding_source_status table'
);

select throws_like(
  $$
    delete from cif.additional_funding_source_status where status_name='changed by internal';
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from additional_funding_source_status table'
);


select finish();

rollback;
