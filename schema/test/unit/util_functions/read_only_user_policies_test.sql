begin;

select plan(5);

select has_function('cif_private', 'read_only_user_policies', 'function cif_private.read_only_user_policies exists');
create role test_role;

select cif_private.read_only_user_policies('test_role');

select is(
  (select cif_private.verify_policy('select', 'test_role_select_cif_user', 'cif_user', 'test_role')),
  true,
  'test_role_select_cif_user policy is created'
);

select throws_like(
  $$select cif_private.verify_policy('insert', 'test_role_insert_cif_user', 'cif_user', 'test_role')$$,
  'Policy % does not exist',
  'test_role_insert_cif_user policy is not created'
);

select throws_like(
  $$select cif_private.verify_policy('update', 'test_role_update_cif_user', 'cif_user', 'test_role')$$,
  'Policy % does not exist',
  'test_role_update_cif_user policy is not created'
);

select throws_like(
  $$select cif_private.verify_policy('delete', 'test_delete_select_cif_user', 'cif_user', 'test_role')$$,
  'Policy % does not exist',
  'test_role_delete_cif_user policy is not created'
);

rollback;
