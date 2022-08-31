-- Revert cif:tables/payment_001 from pg

begin;

alter table cif.payment rename column gross_amount to adjusted_gross_amount;
alter table cif.payment rename column net_amount to adjusted_net_amount;

commit;
