-- Revert cif:mutations/generate_reports from pg

begin;

drop function cif.generate_reports;

commit;
