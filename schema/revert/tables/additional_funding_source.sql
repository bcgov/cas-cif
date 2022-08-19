-- Revert cif:tables/additional_funding_source from pg

begin;

drop table cif.additional_funding_source;

commit;
