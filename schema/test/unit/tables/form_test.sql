begin;
select plan(10);

select has_table('cif', 'form', 'table cif.form exists');

select columns_are(
  'cif',
  'form',
  ARRAY[
  'id',
  'slug',
  'json_schema',
  'description',
  'json_schema_generator',
  'form_change_commit_handler',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'archived_at',
  'archived_by'
  ],
  'columns in cif.form match expected columns'
);

insert into cif.form (slug, json_schema, description) values ('test_slug', '{}', 'A test form');

-- Row level security tests --

-- Test setup
set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.form
  $$,
  'cif_admin can view all data in the form table'
);

select throws_like(
  $$
    update cif.form set slug = 'new slug'
  $$,
  'permission denied%',
  'cif_admin cannot update data in the form table'
);

select throws_like(
  $$
    insert into cif.form (slug, json_schema, description) values ('test_slug_3', '{}', 'Another test form');
  $$,
  'permission denied%',
  'cif_admin cannot insert data in the form table'
);

select throws_like(
  $$
    delete from cif.form where slug is not null;
  $$,
  'permission denied%',
  'cif_admin cannot delete data in the form table'
);

-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.form
  $$,
  'cif_internal can view all data in the form table'
);

select throws_like(
  $$
    update cif.form set slug = 'new slug'
  $$,
  'permission denied%',
  'cif_internal cannot update data in the form table'
);

select throws_like(
  $$
    insert into cif.form (slug, json_schema, description) values ('test_slug_2', '{}', 'Another test form');
  $$,
  'permission denied%',
  'cif_internal cannot insert data in the form table'
);

select throws_like(
  $$
    delete from cif.form where slug is not null;
  $$,
  'permission denied%',
  'cif_internal cannot delete data in the form table'
);
