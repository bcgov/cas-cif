-- Revert cif:tables/report_type_004.sql from pg

begin;

delete from cif.report_type where name = 'Interim Summary Report';

commit;
