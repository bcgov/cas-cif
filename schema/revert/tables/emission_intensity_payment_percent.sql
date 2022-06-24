-- Revert cif:tables/emission_intensity_payment_percent from pg

begin;

drop table cif.emission_intensity_payment_percent;

commit;
