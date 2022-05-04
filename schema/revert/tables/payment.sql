-- Revert cif:tables/payment from pg

begin;

drop table cif.payment;

commit;
