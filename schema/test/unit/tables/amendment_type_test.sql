begin;

select plan(6);

select has_table('cif', 'amendment_type', 'table cif.amendment_type exists');

select columns_are(
  'cif',
  'amendment_type',
  ARRAY[
    'name',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by'
  ],
  'columns in cif.amendment_type match expected columns'
);

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select is(
  (select count(*) from cif.amendment_type),
  3::bigint,
    'cif_admin can view all data in amendment_type table'
);

select throws_like(
  $$
    delete from cif.amendment_type where name='changed by admin';
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table amendment_type'
);

-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.amendment_type
  $$,
  ARRAY['3'::bigint],
    'cif_internal can view all data from amendment_type table'
);

select throws_like(
  $$
    delete from cif.amendment_type where name='changed by internal';
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from amendment_type table'
);


select finish();

rollback;
