-- Revert cif:tables/emission_intensity_payment_percentage from pg

begin;

drop table cif.emission_intensity_payment_percentage;

commit;
