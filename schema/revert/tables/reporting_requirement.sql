-- Revert cif:tables/reporting_requirement from pg


begin;

drop table cif.reporting_requirement;

commit;
