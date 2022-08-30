begin;

select plan(6);

select has_table('cif', 'amendment_status', 'table cif.amendment_status exists');

select columns_are(
  'cif',
  'amendment_status',
  ARRAY[
    'name',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by'
  ],
  'columns in cif.amendment_status match expected columns'
);

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.amendment_status
  $$,
    'cif_admin can view all data in amendment_status table'
);

select throws_like(
  $$
    delete from cif.amendment_status where name='changed by admin';
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table amendment_status'
);

-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.amendment_status
  $$,
  ARRAY['4'::bigint],
    'cif_internal can view all data from amendment_status table'
);

select throws_like(
  $$
    delete from cif.amendment_status where name='changed by internal';
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from amendment_status table'
);


select finish();

rollback;
