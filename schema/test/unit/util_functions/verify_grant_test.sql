begin;
select plan(10);

create table cif.test_table
(
  id integer primary key generated always as identity,
  allowed text,
  not_allowed text
);

create role test_role;

select has_function(
  'cif_private', 'verify_grant',
  'Function verify_grant should exist'
);

-- Passes when should pass

grant all on table cif.test_table to test_role;

select lives_ok(
  $$
    select cif_private.verify_grant('all', 'test_table', 'test_role');
  $$,
  'verify_grant passes when all permissions granted to user'
);

revoke all on table cif.test_table from test_role;
grant select on table cif.test_table to test_role;

select lives_ok(
  $$
    select cif_private.verify_grant('select', 'test_table', 'test_role');
  $$,
  'verify_grant passes when one permission granted to user'
);

revoke all on table cif.test_table from test_role;
grant all (allowed) on table cif.test_table to test_role;

select lives_ok(
  $$
    select cif_private.verify_grant('all', 'test_table', 'test_role', ARRAY['allowed']);
  $$,
  'verify_grant passes when all permissions granted to user on a specific column'
);

revoke all on table cif.test_table from test_role;
grant select (allowed) on table cif.test_table to test_role;

select lives_ok(
  $$
    select cif_private.verify_grant('select', 'test_table', 'test_role', ARRAY['allowed']);
  $$,
  'verify_grant passes when one permission granted to user on a specific column'
);

revoke all on table cif.test_table from test_role;

-- Throws when should throw

select throws_ok(
  $$
    select cif_private.verify_grant('bubbles', 'test_table', 'test_role');
  $$,
  'P0001',
  'invalid operation variable. Must be one of [select, insert, update, delete, truncate, references, trigger]',
  'Function verify_grant throws an exception if the operation variable is not in (select, insert, update, delete, truncate, references, trigger)'
);

select throws_ok(
  $$
    select cif_private.verify_grant('select', 'test_table', 'test_role');
  $$,
  'P0001',
  'Grant: select on table test_table to role test_role does not exist',
  'Function verify_grant throws if single operation grant does not exist'
);

grant select on table cif.test_table to test_role;

select throws_ok(
  $$
    select cif_private.verify_grant('all', 'test_table', 'test_role');
  $$,
  'P0001',
  'Grant: insert on table test_table to role test_role does not exist',
  'Function verify_grant throws if `all` is passed, but role does not have all permissions'
);

revoke all on table cif.test_table from test_role;

select throws_ok(
  $$
    select cif_private.verify_grant('select', 'test_table', 'test_role', ARRAY['allowed']);
  $$,
  'P0001',
  'Grant: select on column allowed in table test_table to role test_role does not exist',
  'Function verify_grant throws if single operation grant on a specific column does not exist'
);

grant select (allowed) on table cif.test_table to test_role;

select throws_ok(
  $$
    select cif_private.verify_grant('all', 'test_table', 'test_role', ARRAY['allowed']);
  $$,
  'P0001',
  'Grant: insert on column allowed in table test_table to role test_role does not exist',
  'Function verify_grant throws if all operation grant does not exist on a specific column'
);

select finish();
rollback;
