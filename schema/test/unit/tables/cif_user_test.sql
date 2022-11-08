begin;
select plan(34);

select has_table('cif', 'cif_user', 'table cif.cif_user exists');
select has_column('cif', 'cif_user', 'id', 'table cif.cif_user has id column');
select has_column('cif', 'cif_user', 'given_name', 'table cif.cif_user has given_name column');
select has_column('cif', 'cif_user', 'family_name', 'table cif.cif_user has family_name column');
select has_column('cif', 'cif_user', 'email_address', 'table cif.cif_user has email_address column');
select has_column('cif', 'cif_user', 'session_sub', 'table cif.cif_user has session_sub column');
select has_column('cif', 'cif_user', 'created_at', 'table cif.cif_user has created_at column');
select has_column('cif', 'cif_user', 'updated_at', 'table cif.cif_user has updated_at column');
select has_column('cif', 'cif_user', 'archived_at', 'table cif.cif_user has archived_at column');
select has_column('cif', 'cif_user', 'created_by', 'table cif.cif_user has created_by column');
select has_column('cif', 'cif_user', 'updated_by', 'table cif.cif_user has updated_by column');
select has_column('cif', 'cif_user', 'archived_by', 'table cif.cif_user has archived_by column');


insert into cif.cif_user
  (given_name, family_name, email_address, session_sub) values
  ('foo1', 'bar', 'foo1@bar.com', '11111111-1111-1111-1111-111111111112'),
  ('foo2', 'bar', 'foo2@bar.com', '11111111-1111-1111-1111-111111111113'),
  ('foo3', 'bar', 'foo3@bar.com', '11111111-1111-1111-1111-111111111114');

-- Row level security tests --

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.cif_user
  $$,
    'cif_admin can view all data in cif_user table'
);

select lives_ok(
  $$
    insert into cif.cif_user (session_sub, given_name, family_name) values ('11111111-1111-1111-1111-111111111111'::varchar, 'test', 'testerson');
  $$,
    'cif_admin can insert data in cif_user table'
);

select lives_ok(
  $$
    update cif.cif_user set given_name = 'changed by admin' where session_sub='11111111-1111-1111-1111-111111111111'::varchar;
  $$,
    'cif_admin can change data in cif_user table'
);

select results_eq(
  $$
    select count(session_sub) from cif.cif_user where given_name = 'changed by admin'
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin'
);

select throws_like(
  $$
    update cif.cif_user set session_sub = 'ca716545-a8d3-4034-819c-5e45b0e775c9' where session_sub = '11111111-1111-1111-1111-111111111111'::varchar;
  $$,
    'permission denied%',
    'cif_admin can not change data in the session_sub column in cif_user table'
);

select throws_like(
  $$
    delete from cif.cif_user where id=1
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table cif_user'
);


-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.cif_user
  $$,
  ARRAY['4'::bigint],
    'cif_internal can view all data from cif_user'
);

select lives_ok(
  $$
    update cif.cif_user set given_name = 'doood' where session_sub=(select sub from cif.session())
  $$,
    'cif_internal can update data if their session_sub matches the session_sub of the row'
);

select results_eq(
  $$
    select given_name from cif.cif_user where session_sub=(select sub from cif.session())
  $$,
  ARRAY['doood'::varchar(1000)],
    'Data was changed by cif_internal'
);

select throws_like(
  $$
    update cif.cif_user set session_sub = 'ca716545-a8d3-4034-819c-5e45b0e775c9' where session_sub!=(select sub from cif.session())
  $$,
  'permission denied%',
    'cif_internal cannot update their session_sub'
);

select throws_like(
  $$
    delete from cif.cif_user where id=1
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from table_cif_user'
);

-- Try to update user data where session_sub does not match
update cif.cif_user set given_name = 'buddy' where session_sub!=(select sub from cif.session());

select is_empty(
  $$
    select * from cif.cif_user where given_name='buddy'
  $$,
    'cif_internal cannot update data if their session_sub does not match the session_sub of the row'
);

-- cif_external
set role cif_external;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.cif_user
  $$,
  ARRAY['4'::bigint],
    'cif_external can view all data from cif_user'
);

select lives_ok(
  $$
    update cif.cif_user set given_name = 'doood' where session_sub=(select sub from cif.session())
  $$,
    'cif_external can update data if their session_sub matches the session_sub of the row'
);

select results_eq(
  $$
    select given_name from cif.cif_user where session_sub=(select sub from cif.session())
  $$,
  ARRAY['doood'::varchar(1000)],
    'Data was changed by cif_external'
);

select throws_like(
  $$
    update cif.cif_user set session_sub = 'ca716545-a8d3-4034-819c-5e45b0e775c9' where session_sub!=(select sub from cif.session())
  $$,
  'permission denied%',
    'cif_external cannot update their session_sub'
);

select throws_like(
  $$
    delete from cif.cif_user where id=1
  $$,
  'permission denied%',
    'cif_external cannot delete rows from table_cif_user'
);

-- Try to update user data where session_sub does not match
update cif.cif_user set given_name = 'buddy' where session_sub!=(select sub from cif.session());

select is_empty(
  $$
    select * from cif.cif_user where given_name='buddy'
  $$,
    'cif_external cannot update data if their session_sub does not match the session_sub of the row'
);


-- cif_guest
set role cif_guest;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select session_sub from cif.cif_user
  $$,
  ARRAY['11111111-1111-1111-1111-111111111111'::varchar],
    'cif_guest can only select their own user'
);

select throws_like(
  $$
    update cif.cif_user set session_sub = 'ca716545-a8d3-4034-819c-5e45b0e775c9' where session_sub!=(select sub from cif.session())
  $$,
  'permission denied%',
    'cif_guest cannot update their session_sub'
);

select throws_like(
  $$
    insert into cif.cif_user (session_sub, given_name, family_name) values ('21111111-1111-1111-1111-111111111111'::varchar, 'test', 'testerson');
  $$,
  'permission denied%',
  'cif_guest cannot insert'
);

select throws_like(
  $$
    delete from cif.cif_user where id=1
  $$,
  'permission denied%',
    'cif_guest cannot delete rows from table_cif_user'
);

select finish();
rollback;
