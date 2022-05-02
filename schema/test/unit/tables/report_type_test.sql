begin;

select plan(10);

select has_table('cif', 'report_type', 'table cif.report_type exists');

select columns_are(
  'cif',
  'report_type',
  ARRAY[
    'id',
    'name',
    'form_schema'
  ],
  'columns in cif.report_type match expected columns'
);

insert into cif.report_type
  (name, form_schema) values
  ('type1', '{}'),
  ('type2', '{}'),
  ('type3', '{}');

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
    insert into cif.report_type (name, form_schema) values ('type4', '{}');
  $$,
    'cif_admin can insert data in report_type table'
);

select lives_ok(
  $$
    update cif.report_type set name='changed by admin' where name='type4';
  $$,
    'cif_admin can change data in report_type table'
);

select results_eq(
  $$
    select count(id) from cif.report_type where name= 'changed by admin'
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin'
);

select throws_like(
  $$
    delete from cif.report_type where id=1
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
  ARRAY['4'::bigint],
    'cif_internal can view all data from report_type table'
);

select lives_ok(
  $$
    update cif.report_type set name= 'changed_by_internal' where name='type3';
  $$,
    'cif_internal can update data in the report_type table'
);

select throws_like(
  $$
    delete from cif.report_type where id=1
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from report_type table'
);


select finish();

rollback;
