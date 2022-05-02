-- Deploy cif:types/budget_item_category to pg

begin;

create type cif.budget_item_category as enum (
  'general',
  'materials, supplies, equipment and other items'
);

comment on type cif.budget_item_category is 'The category of a budget item.';

commit;
