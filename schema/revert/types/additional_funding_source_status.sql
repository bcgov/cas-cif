-- Revert cif:types/additional_funding_source_status from pg

begin;

drop type cif.additional_funding_source_status;

commit;
