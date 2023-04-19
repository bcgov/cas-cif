begin;

select plan(6);

select has_table('cif', 'revision_type', 'table cif.revision_type exists');

select columns_are(
  'cif',
  'revision_type',
  ARRAY[
    'type',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by'
  ],
  'columns in cif.revision_type match expected columns'
);


-- Test setup



-- set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.revision_type
  $$,
    'cif_admin can view all data in revision_type table'
);

select throws_like(
  $$
    delete from cif.revision_type where type='Amendment'
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table revision_type'
);
-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.revision_type
  $$,
  ARRAY['2'::bigint],
    'cif_internal can view all data from revision_type table'
);

select throws_like(
  $$
    delete from cif.revision_type where type='Amendment'
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from revision_type table'
);

select finish();

rollback;
