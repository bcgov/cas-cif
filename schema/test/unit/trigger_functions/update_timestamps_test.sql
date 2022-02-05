begin;

select plan(8);

-- Init test
insert into cif.cif_user
  (first_name, last_name, email_address, uuid) values
  ('foo1', 'bar', 'foo1@bar.com', '11111111-1111-1111-1111-111111111112'),
  ('foo2', 'bar', 'foo2@bar.com', '11111111-1111-1111-1111-111111111113'),
  ('foo3', 'bar', 'foo3@bar.com', '11111111-1111-1111-1111-111111111114');

set jwt.claims.sub to '11111111-1111-1111-1111-111111111112';

create table timestamp_compare (
  id integer primary key generated always as identity,
  old_timestamp timestamptz
);

create table test_table_all (
  id integer primary key generated always as identity,
  test_name varchar(1000),
  created_at timestamp with time zone not null default now(),
  created_by int references cif.cif_user,
  updated_at timestamp with time zone not null default now(),
  updated_by int references cif.cif_user,
  archived_at timestamp with time zone,
  archived_by int references cif.cif_user
);

create table test_table_no_trigger_columns (
  id integer primary key generated always as identity,
  test_name varchar(1000)
);

create trigger _100_timestamps
  before insert or update on test_table_all
  for each row
  execute procedure cif_private.update_timestamps();

create trigger _100_timestamps
  before insert or update on test_table_no_trigger_columns
  for each row
  execute procedure cif_private.update_timestamps();

select has_function(
  'cif_private', 'update_timestamps',
  'Function update_timestamps should exist'
);

-- Sets created_at/by on insert when all columns exist
insert into test_table_all (test_name) values ('create');
select is (
  (select created_by from test_table_all where id=1),
  (select id from cif.cif_user where uuid='11111111-1111-1111-1111-111111111112'),
  'trigger sets created_by on insert'
);
select isnt (
  (select created_at from test_table_all where id=1),
  null,
  'trigger sets created_at on insert'
);

-- Sets updated_at/by on update when all columns exist
insert into timestamp_compare(old_timestamp) values ((select created_at from test_table_all where id=1));
update test_table_all set test_name = 'update';
select is (
  (select updated_by from test_table_all where id=1),
  (select id from cif.cif_user where uuid='11111111-1111-1111-1111-111111111112'),
  'trigger sets updated_by on update'
);
select isnt (
  (select updated_at from test_table_all where id=1),
  (select old_timestamp from timestamp_compare where id=1),
  'trigger sets updated_at on update'
);

-- Sets archived_by on update when archived_at is changed
update test_table_all set archived_at=now();
select is (
  (select archived_by from test_table_all where id=1),
  (select id from cif.cif_user where uuid='11111111-1111-1111-1111-111111111112'),
  'trigger sets archived_by on update of archived_at column'
);

-- Trigger does not error on insert when no created_at/by columns exist
select lives_ok(
  $$ insert into test_table_no_trigger_columns(test_name) values('create_only') $$,
  'table can insert without error when no timestamp/user columns exist'
);

-- Trigger does not error on update when no updated_at/by columns exist
select lives_ok(
  $$ update test_table_no_trigger_columns set test_name='updated' $$,
  'table can update without error when no timestamp/user columns exist'
);

select * from finish();

rollback;
