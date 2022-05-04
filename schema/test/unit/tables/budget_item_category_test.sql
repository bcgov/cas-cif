begin;

select plan(12);

select has_table('cif', 'budget_item_category', 'table cif.budget_item_category exists');

select columns_are(
  'cif',
  'budget_item_category',
  ARRAY[
    'category',
    'active',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
    'archived_at',
    'archived_by'
  ],
  'columns in cif.budget_item_category match expected columns'
);

select results_eq(
  $$
    select category, active from cif.budget_item_category order by category
  $$,
  $$
    values
      ('general'::varchar, true),
      ('materials, supplies, equipment and other items'::varchar, true);
  $$,
  'cif.budget_item_category contains the expected values'
);

set jwt.claims.sub to '11111111-1111-1111-1111-111111111111';

-- cif_admin
set role cif_admin;
select concat('current user is: ', (select current_user));

select lives_ok(
  $$
    select * from cif.budget_item_category
  $$,
    'cif_admin can view all data in budget_item_category table'
);

select lives_ok(
  $$
    insert into cif.budget_item_category (category, active) values ('pending', true);
  $$,
    'cif_admin can insert data in budget_item_category table'
);

select lives_ok(
  $$
    update cif.budget_item_category set active=false where category='pending';
  $$,
    'cif_admin can change data in budget_item_category table'
);

select results_eq(
  $$
    select count(category) from cif.budget_item_category where category= 'pending'
  $$,
    ARRAY[1::bigint],
    'Data was changed by cif_admin in budget_item_category table'
);

select throws_like(
  $$
    insert into cif.budget_item_category (category, active) values ('general', true);
  $$,
  'duplicate key value violates unique constraint%',
    'cif_admin cannot insert duplicate data in budget_item_category table'
);

select throws_like(
  $$
    delete from cif.budget_item_category where category='general'
  $$,
  'permission denied%',
    'Administrator cannot delete rows from table budget_item_category'
);


-- cif_internal
set role cif_internal;
select concat('current user is: ', (select current_user));

select results_eq(
  $$
    select count(*) from cif.budget_item_category
  $$,
  ARRAY['3'::bigint],
    'cif_internal can view all data from budget_item_category table'
);

select lives_ok(
  $$
    update cif.budget_item_category set active= false where category='materials, supplies, equipment and other items';
  $$,
    'cif_internal can update data in the budget_item_category table'
);

select throws_like(
  $$
    delete from cif.budget_item_category where category='materials, supplies, equipment and other items';
  $$,
  'permission denied%',
    'cif_internal cannot delete rows from budget_item_category table'
);

select finish();
rollback;
