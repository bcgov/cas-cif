-- Revert cif:tables/operator from pg

begin;

drop table cif.operator;

commit;
