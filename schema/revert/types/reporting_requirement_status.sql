-- Revert cif:types/reporting_requirement_status from pg


begin;

drop type cif.reporting_requirement_status;

commit;
