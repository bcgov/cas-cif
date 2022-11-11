-- Revert cif:mutations/generate_quarterly_reports from pg

begin;

drop function cif.generate_quarterly_reports;

commit;
