begin;

select plan(10);

select has_table('cif', 'project_type', 'table cif.project_type exists');

select columns_are(
  'cif',
  'project_type',
  ARRAY[
    'id',
    'name',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by'
  ],
  'columns in cif.project_type match expected columns'
);

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.project_type
  $$,
    'cif_admin can view all data in project_type table'
);

select lives_ok(
  $$
    insert into cif.project_type (name) values ('Test Fuel Switching');
  $$,
    'cif_admin can insert data in project_type table'
);

select lives_ok(
  $$
    update cif.project_type set name='changed by admin' where name='Test Fuel Switching';
  $$,
    'cif_admin can change data in project_type table'
);

select results_eq(
  $$
    select count(name) from cif.project_type where name= 'changed by admin'
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin'
);

select throws_like(
  $$
    delete from cif.project_type where name='changed by admin';
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table project_type'
);

-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.project_type
  $$,
  -- 12 project types + project type added in earlier test = 13
  ARRAY['13'::bigint],
    'cif_internal can view all data from project_type table'
);

select lives_ok(
  $$
    update cif.project_type set name= 'changed by internal' where name='changed by admin';
  $$,
    'cif_internal can update data in the project_type table'
);

select throws_like(
  $$
    delete from cif.project_type where name='changed by internal';
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from project_type table'
);


select finish();

rollback;
