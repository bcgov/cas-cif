-- Revert cif:tables/funding_parameters from pg


begin;

drop table cif.funding_parameters;

commit;
