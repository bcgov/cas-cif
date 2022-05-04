-- Revert cif:tables/budget_item_category from pg

begin;

  drop table cif.budget_item_category;

commit;
