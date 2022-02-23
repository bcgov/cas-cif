begin;
select plan(13);

select has_table('cif', 'project_manager_label', 'table cif.project_manager_label exists');

select columns_are(
  'cif',
  'project_manager_label',
  ARRAY[
    'id',
    'label',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by'
  ],
  'columns in cif.project_manager_label match expected columns'
);

select col_is_unique( 'cif', 'project_manager_label', 'label', 'There is a unique constraint on the label column' );

-- Row level security tests --

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.project_manager_label
  $$,
    'cif_admin can view all data in project_manager_label table'
);

select lives_ok(
  $$
    insert into cif.project_manager_label (label) values ('admin new label');
  $$,
    'cif_admin can insert data in project_manager_label table'
);

select results_eq(
  $$
    select count(id) from cif.project_manager_label where label = 'admin new label'
  $$,
    ARRAY[1::bigint],
    'Data was inserted by cif_admin'
);


select lives_ok(
  $$
    update cif.project_manager_label set label = 'changed by admin' where label='admin new label';
  $$,
    'cif_admin can change data in project_manager_label table'
);

select results_eq(
  $$
    select count(id) from cif.project_manager_label where label = 'changed by admin'
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin'
);

select throws_like(
  $$
    delete from cif.project_manager_label where id=1
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table project_manager_label'
);


-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.project_manager_label
  $$,
  ARRAY['5'::bigint],
    'cif_internal can view all data from project_manager_label'
);

select throws_like(
  $$
    insert into cif.project_manager_label (label) values ('created_by_internal')
  $$,
  'permission denied%',
  'cif_internal cannot insert data in the project_manager_label table'
);

select throws_like(
  $$
    update cif.project_manager_label set label = 'changed_by_internal' where id=1
  $$,
  'permission denied%',
  'cif_internal cannot update data in the project_manager_label table'
);

select throws_like(
  $$
    delete from cif.project_manager_label where id=1
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from table_project_manager_label'
);

select finish();
rollback;
