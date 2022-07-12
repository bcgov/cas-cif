-- Revert cif:tables/funding_parameter from pg


begin;

drop table cif.funding_parameter;

commit;
