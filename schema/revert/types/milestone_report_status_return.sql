-- Revert cif:types/milestone_report_status_return from pg

begin;

drop type cif.milestone_report_status_return;

commit;
