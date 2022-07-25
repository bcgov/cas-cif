-- Deploy cif:tables/report_type to pg


begin;

delete from cif.report_type where name = 'TEIMP';

commit;
