-- Revert cif:tables/reporting_requirement_status from pg

begin;

  drop table cif.reporting_requirement_status;

commit;
