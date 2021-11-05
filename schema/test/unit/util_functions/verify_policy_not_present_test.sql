begin;
select plan(4);

create table test_table
(
  id integer primary key generated always as identity
);

create table test_table_2
(
  id integer primary key generated always as identity
);

create role test_role;

select has_function(
  'cif_private', 'verify_policy_not_present',
  'Function verify_policy_not_present should exist'
);

grant all on table test_table to test_role;

create policy test_policy on test_table
  for select to test_role using (true);

-- Passes when should pass

select lives_ok(
  $$
    select cif_private.verify_policy_not_present('test_policy', 'test_table_2');
  $$,
  'verify_policy_not_present passes when test_policy policy doesnt exist on a table'
);

select lives_ok(
  $$
    select cif_private.verify_policy_not_present('nonexistant_policy', 'test_table');
  $$,
  'verify_policy_not_present passes when nonexistant_policy policy doesnt exist on a table'
);

-- Throws when should throw

select throws_ok(
  $$
    select cif_private.verify_policy_not_present('test_policy', 'test_table');
  $$,
  'P0001',
  'Policy test_policy on table test_table already exists',
  'Function verify_policy_not_present throws an exception if there is already a policy with that name on that table'
);

select finish();
rollback;
