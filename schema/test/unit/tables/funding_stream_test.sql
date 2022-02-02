begin;
select plan(19);

select has_table('cif', 'funding_stream', 'table cif.funding_stream exists');
select has_column('cif', 'funding_stream', 'id', 'table cif.funding_stream has id column');
select has_column('cif', 'funding_stream', 'name', 'table cif.funding_stream has name column');
select has_column('cif', 'funding_stream', 'description', 'table cif.funding_stream has description column');
select has_column('cif', 'funding_stream', 'created_at', 'table cif.funding_stream has created_at column');
select has_column('cif', 'funding_stream', 'updated_at', 'table cif.funding_stream has updated_at column');
select has_column('cif', 'funding_stream', 'archived_at', 'table cif.funding_stream has archived_at column');
select has_column('cif', 'funding_stream', 'created_by', 'table cif.funding_stream has created_by column');
select has_column('cif', 'funding_stream', 'updated_by', 'table cif.funding_stream has updated_by column');
select has_column('cif', 'funding_stream', 'archived_by', 'table cif.funding_stream has archived_by column');


-- Row level security tests --

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.funding_stream
  $$,
    'cif_admin can view all data in funding_stream table'
);

select lives_ok(
  $$
    insert into cif.funding_stream (name, description) values ('IA2', 'Test IA2');
  $$,
    'cif_admin can insert data in funding_stream table'
);

select lives_ok(
  $$
    update cif.funding_stream set name = 'changed by admin' where name = 'IA2';
  $$,
    'cif_admin can change data in funding_stream table'
);

select results_eq(
  $$
    select count(id) from cif.funding_stream where name = 'changed by admin'
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin'
);

select throws_like(
  $$
    delete from cif.funding_stream where id=1
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table funding_stream'
);


-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.funding_stream
  $$,
  ARRAY['3'::bigint],
    'cif_internal can view all data from funding_stream'
);

select lives_ok(
  $$
    update cif.funding_stream set name = 'changed_by_internal' where name = 'changed by admin';
  $$,
    'cif_internal can update data in the funding_stream table'
);

select results_eq(
  $$
    select name from cif.funding_stream where name = 'changed_by_internal';
  $$,
  ARRAY['changed_by_internal'::varchar(1000)],
    'Data was changed by cif_internal'
);

select throws_like(
  $$
    delete from cif.funding_stream where id=1
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from table_funding_stream'
);

select finish();
rollback;
