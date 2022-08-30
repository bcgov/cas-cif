-- Deploy cif:tables/payment_001 to pg
-- requires: tables/payment

begin;

alter table cif.payment rename column adjusted_gross_amount to gross_amount;
alter table cif.payment rename column adjusted_net_amount to net_amount;

commit;
