-- Revert cif:types/budget_item_category from pg

begin;

  drop type if exists cif.budget_item_category;

commit;
