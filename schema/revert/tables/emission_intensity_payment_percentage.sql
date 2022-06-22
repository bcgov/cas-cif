-- Revert cif:tables/emission_intensity_lookup from pg

begin;

drop table cif.emission_intensity_lookup;

commit;
