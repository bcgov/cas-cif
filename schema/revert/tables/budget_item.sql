-- Revert cif:tables/budget_item from pg

begin;

drop table cif.budget_item;

commit;
