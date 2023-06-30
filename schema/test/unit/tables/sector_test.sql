begin;

select plan(11);

select has_table('cif', 'sector', 'table cif.sector exists');

select columns_are(
  'cif',
  'sector',
  ARRAY[
    'sector_name',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by'
  ],
  'columns in cif.sector match expected columns'
);

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select is(
  (select count(*) from cif.sector),
  11::bigint,
    'cif_admin can view all data in sector table'
);

select lives_ok(
  $$
    insert into cif.sector (sector_name) values ('Test Sector');
  $$,
    'cif_admin can insert data in sector table'
);

select lives_ok(
  $$
    update cif.sector set sector_name='changed by admin' where sector_name='Test Sector';
  $$,
    'cif_admin can change data in sector table'
);

select results_eq(
  $$
    select count(sector_name) from cif.sector where sector_name= 'changed by admin'
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin'
);

select throws_like(
  $$
    delete from cif.sector where sector_name='changed by admin';
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table sector'
);

-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.sector
  $$,
  ARRAY['12'::bigint],
    'cif_internal can view all data from sector table'
);

select lives_ok(
  $$
    insert into cif.sector (sector_name) values ('Test Sector 2');
  $$,
    'cif_admin can insert data in sector table'
);

select lives_ok(
  $$
    update cif.sector set sector_name= 'changed by internal' where sector_name='changed by admin';
  $$,
    'cif_internal can update data in the sector table'
);

select throws_like(
  $$
    delete from cif.sector where sector_name='changed by internal';
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from sector table'
);


select finish();

rollback;
