begin;

select plan(9);

select has_table('cif', 'revision_status', 'table cif.revision_status exists');

select columns_are(
  'cif',
  'revision_status',
  ARRAY[
    'name',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by',
    'is_amendment_specific',
    'sorting_order'
  ],
  'columns in cif.revision_status match expected columns'
);

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.revision_status
  $$,
    'cif_admin can view all data in revision_status table'
);

select throws_like(
  $$
    delete from cif.revision_status where name='changed by admin';
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table revision_status'
);

-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.revision_status
  $$,
  ARRAY['5'::bigint], -- 5 because 'Approved' was removed
    'cif_internal can view all data from revision_status table'
);

select throws_like(
  $$
    delete from cif.revision_status where name='changed by internal';
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from revision_status table'
);

select is (
  (select count(*) from cif.revision_status where is_amendment_specific = false),
  2::bigint,
  'sets is_amendment_specific to false when status is Draft or Applied'
);

select is (
  (select count(*) from cif.revision_status where is_amendment_specific = true),
  3::bigint,
  'sets is_amendment_specific to false when status is Discussion / Pending Province Approval / Pending Proponent Signature'
);

select results_eq(
  $$
    select name, sorting_order from cif.revision_status order by sorting_order
  $$,
  $$
    values
      ('Draft'::varchar, 0::int),
      ('In Discussion'::varchar, 0::int),
      ('Pending Province Approval'::varchar, 1::int),
      ('Pending Proponent Signature'::varchar, 2::int),
      ('Applied'::varchar, 3::int)
  $$,
  'Has correct sorting_order values'
);

select finish();

rollback;
