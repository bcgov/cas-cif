begin;
select plan(11);

-- Test setup
create table cif.test_table
(
  id integer primary key generated always as identity
);

create table cif.test_table_specific_column_grants
(
  id integer primary key generated always as identity,
  allowed text,
  denied text
);

select has_function(
  'cif_private', 'grant_permissions',
  'Function grant_permissions should exist'
);

select throws_ok(
  $$
    select cif_private.grant_permissions('badoperation', 'test_table', 'cif_admin');
  $$,
  'P0001',
  'invalid operation variable. Must be one of [select, insert, update, delete]',
  'Function grant_permissions throws an exception if the operation variable is not in (select, insert, update, delete)'
);

select table_privs_are (
  'cif',
  'test_table',
  'cif_admin',
  ARRAY[]::text[],
  'role cif_admin has not yet been granted any privileges on cif.test_table'
);

select lives_ok(
  $$
    select cif_private.grant_permissions('select', 'test_table', 'cif_admin');
  $$,
  'Function grants select'
);

select lives_ok(
  $$
    select cif_private.grant_permissions('insert', 'test_table', 'cif_admin');
  $$,
  'Function grants insert'
);

select lives_ok(
  $$
    select cif_private.grant_permissions('update', 'test_table', 'cif_admin');
  $$,
  'Function grants update'
);

select lives_ok(
  $$
    select cif_private.grant_permissions('delete', 'test_table', 'cif_admin');
  $$,
  'Function grants delete'
);

select table_privs_are (
  'cif',
  'test_table',
  'cif_admin',
  ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
  'role cif_admin has been granted select, insert, update, delete on cif.test_table'
);

select any_column_privs_are (
  'cif',
  'test_table_specific_column_grants',
  'cif_admin',
  ARRAY[]::text[],
  'role cif_admin has not yet been granted any privileges on columns in cif.test_table_specific_column_grants'
);

select lives_ok(
  $$
    select cif_private.grant_permissions('select', 'test_table_specific_column_grants', 'cif_admin', ARRAY['allowed']);
  $$,
  'Function grants select when specific columns are specified'
);

select column_privs_are (
  'cif',
  'test_table_specific_column_grants',
  'allowed',
  'cif_admin',
  ARRAY['SELECT'],
  'cif_admin has privilege SELECT only on column `allowed` in test_table_specific_column_grants'
);

select finish();
rollback;
