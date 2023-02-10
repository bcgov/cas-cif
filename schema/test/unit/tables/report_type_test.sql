begin;

select plan(10);

select has_table('cif', 'report_type', 'table cif.report_type exists');

select columns_are(
  'cif',
  'report_type',
  ARRAY[
    'name',
    'is_milestone',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by',
    'has_expenses'
  ],
  'columns in cif.report_type match expected columns'
);

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.report_type
  $$,
    'cif_admin can view all data in report_type table'
);

select lives_ok(
  $$
    insert into cif.report_type (name) values ('Test Milestone');
  $$,
    'cif_admin can insert data in report_type table'
);

select lives_ok(
  $$
    update cif.report_type set name='changed by admin' where name='Test Milestone';
  $$,
    'cif_admin can change data in report_type table'
);

select results_eq(
  $$
    select count(name) from cif.report_type where name= 'changed by admin'
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin'
);

select throws_like(
  $$
    delete from cif.report_type where name='changed by admin';
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table report_type'
);

-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.report_type
  $$,
  ARRAY['9'::bigint],
    'cif_internal can view all data from report_type table'
);

select lives_ok(
  $$
    update cif.report_type set name= 'changed by internal' where name='changed by admin';
  $$,
    'cif_internal can update data in the report_type table'
);

select throws_like(
  $$
    delete from cif.report_type where name='changed by internal';
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from report_type table'
);


select finish();

rollback;
