-- Revert cif:tables/milestone_report from pg

begin;

drop table cif.milestone_report;

commit;
