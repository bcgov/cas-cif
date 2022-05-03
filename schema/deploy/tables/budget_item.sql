-- Deploy cif:tables/budget_item to pg

begin;
create table cif.budget_item
(
  id integer primary key generated always as identity,
  amount numeric,
  category varchar(100) references cif.budget_item_category not null,
  description varchar(1000),
  is_confirmed boolean not null,
  is_tentative boolean,
  reporting_requirement_id integer references cif.reporting_requirement(id) not null,
  comment varchar(10000)
);

select cif_private.upsert_timestamp_columns('cif', 'budget_item');

do
$grant$
begin

-- Grant cif_internal permissions
perform cif_private.grant_permissions('select', 'budget_item', 'cif_internal');
perform cif_private.grant_permissions('insert', 'budget_item', 'cif_internal');
perform cif_private.grant_permissions('update', 'budget_item', 'cif_internal');

-- Grant cif_admin permissions
perform cif_private.grant_permissions('select', 'budget_item', 'cif_admin');
perform cif_private.grant_permissions('insert', 'budget_item', 'cif_admin');
perform cif_private.grant_permissions('update', 'budget_item', 'cif_admin');

-- Grant cif_external no permissions
-- Grant cif_guest no permissions

end
$grant$;

comment on table cif.budget_item is 'Table containing information about budget item related to a reporting requirement';
comment on column cif.budget_item.id is 'Unique ID for the budget item';
comment on column cif.budget_item.amount is 'The amount of the budget item in CAD';
comment on column cif.budget_item.category is 'The category of the budget item: general and materials, supplies, equipment and other items';
comment on column cif.budget_item.description is 'The description of the budget item';
comment on column cif.budget_item.is_confirmed is 'Whether the budget item is confirmed or not';
comment on column cif.budget_item.is_tentative is 'Whether the budget item is tentative or not';
comment on column cif.budget_item.reporting_requirement_id is 'Foreign key references the cif.reporting_requirement table';

commit;
