-- Revert cif:mutations/generate_annual_reports from pg

begin;

drop function cif.generate_annual_reports;

commit;
