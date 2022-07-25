-- Revert cif:tables/report_type from pg

begin;

drop table cif.report_type;

commit;
