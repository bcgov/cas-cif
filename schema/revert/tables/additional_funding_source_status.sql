-- Revert cif:tables/additional_funding_source_status from pg

begin;

drop table cif.additional_funding_source_status;

commit;
