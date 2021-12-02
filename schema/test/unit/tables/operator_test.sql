begin;
select plan(20);

select has_table('cif', 'operator', 'table cif.operator exists');
select has_column('cif', 'operator', 'id', 'table cif.operator has id column');
select has_column('cif', 'operator', 'legal_name', 'table cif.operator has legal_name column');
select has_column('cif', 'operator', 'trade_name', 'table cif.operator has trade_name column');
select has_column('cif', 'operator', 'bc_registry_id', 'table cif.operator has bc_registry_id column');
select has_column('cif', 'operator', 'created_at', 'table cif.operator has created_at column');
select has_column('cif', 'operator', 'updated_at', 'table cif.operator has updated_at column');
select has_column('cif', 'operator', 'deleted_at', 'table cif.operator has deleted_at column');
select has_column('cif', 'operator', 'created_by', 'table cif.operator has created_by column');
select has_column('cif', 'operator', 'updated_by', 'table cif.operator has updated_by column');
select has_column('cif', 'operator', 'deleted_by', 'table cif.operator has deleted_by column');


insert into cif.operator
  (legal_name, trade_name, bc_registry_id) values
  ('foo1', 'bar', '12345'),
  ('foo2', 'bar2', '54321'),
  ('foo3', 'bar3', '99999');

-- Row level security tests --

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.operator
  $$,
    'cif_admin can view all data in operator table'
);

select lives_ok(
  $$
    insert into cif.operator (legal_name, trade_name, bc_registry_id) values ('foo4', 'bar4', '00000');
  $$,
    'cif_admin can insert data in operator table'
);

select lives_ok(
  $$
    update cif.operator set legal_name = 'changed by admin' where legal_name='foo4';
  $$,
    'cif_admin can change data in operator table'
);

select results_eq(
  $$
    select count(id) from cif.operator where legal_name = 'changed by admin'
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin'
);

select throws_like(
  $$
    delete from cif.operator where id=1
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table operator'
);


-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.operator
  $$,
  ARRAY['4'::bigint],
    'cif_internal can view all data from operator'
);

select lives_ok(
  $$
    update cif.operator set legal_name = 'changed_by_internal' where legal_name='foo3';
  $$,
    'cif_internal can update data in the operator table'
);

select results_eq(
  $$
    select legal_name from cif.operator where trade_name = 'bar3';
  $$,
  ARRAY['changed_by_internal'::varchar(1000)],
    'Data was changed by cif_internal'
);

select throws_like(
  $$
    delete from cif.operator where id=1
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from table_operator'
);

select finish();
rollback;
