begin;
select plan(17);

select has_table('cif', 'funding_stream_rfp', 'table cif.funding_stream_rfp exists');
select has_column('cif', 'funding_stream_rfp', 'id', 'table cif.funding_stream_rfp has id column');
select has_column('cif', 'funding_stream_rfp', 'year', 'table cif.funding_stream_rfp has year column');
select has_column('cif', 'funding_stream_rfp', 'created_at', 'table cif.funding_stream_rfp has created_at column');
select has_column('cif', 'funding_stream_rfp', 'updated_at', 'table cif.funding_stream_rfp has updated_at column');
select has_column('cif', 'funding_stream_rfp', 'archived_at', 'table cif.funding_stream_rfp has archived_at column');
select has_column('cif', 'funding_stream_rfp', 'created_by', 'table cif.funding_stream_rfp has created_by column');
select has_column('cif', 'funding_stream_rfp', 'updated_by', 'table cif.funding_stream_rfp has updated_by column');
select has_column('cif', 'funding_stream_rfp', 'archived_by', 'table cif.funding_stream_rfp has archived_by column');


-- Row level security tests --

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.funding_stream_rfp
  $$,
    'cif_admin can view all data in funding_stream_rfp table'
);

select lives_ok(
  $$
    insert into cif.funding_stream_rfp (year, funding_stream_id) values (9999, 1), (9998, 2);
  $$,
    'cif_admin can insert data in funding_stream_rfp table'
);

select lives_ok(
  $$
    update cif.funding_stream_rfp set year = 1111 where year = 9999;
  $$,
    'cif_admin can change data in funding_stream_rfp table'
);

select results_eq(
  $$
    select count(id) from cif.funding_stream_rfp where year = 1111;
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin'
);

select throws_like(
  $$
    delete from cif.funding_stream_rfp where id=1
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table funding_stream_rfp'
);


-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.funding_stream_rfp
  $$,
  ARRAY['12'::bigint],
    'cif_internal can view all data from funding_stream_rfp'
);

select throws_like(
  $$
    update cif.funding_stream_rfp set year = 2222 where year = 1111;
  $$,
  'permission denied%',
    'cif_internal cannot update rows from table_funding_stream_rfp'
);

select throws_like(
  $$
    delete from cif.funding_stream_rfp where id=1
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from table_funding_stream_rfp'
);

select finish();
rollback;
