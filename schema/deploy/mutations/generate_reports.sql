-- Deploy cif:mutations/generate_reports to pg

begin;

drop function cif.generate_reports;

commit;
