-- Deploy cif:tables/budget_item_category to pg

begin;

create table cif.budget_item_category (
  category varchar(1000) primary key,
  active boolean default true
);

select cif_private.upsert_timestamp_columns('cif', 'budget_item_category');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'budget_item_category', 'cif_internal');
perform cif_private.grant_permissions('insert', 'budget_item_category', 'cif_internal');
perform cif_private.grant_permissions('update', 'budget_item_category', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'budget_item_category', 'cif_admin');
perform cif_private.grant_permissions('insert', 'budget_item_category', 'cif_admin');
perform cif_private.grant_permissions('update', 'budget_item_category', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.budget_item_category is 'Table containing the different category that budget item can have';
comment on column cif.budget_item_category.category is 'The category of a budget item. for example: general, materials, supplies, equipment and other items';
comment on column cif.budget_item_category.active is 'Whether that category is active';

insert into cif.budget_item_category (category)
values
  ('general'),
  ('materials, supplies, equipment and other items');

commit;
