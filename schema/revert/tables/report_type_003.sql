-- Revert cif:tables/report_type_003 from pg

begin;

delete from cif.report_type where name = 'Project Summary Report';

commit;
