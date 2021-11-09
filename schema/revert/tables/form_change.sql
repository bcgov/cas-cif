-- Revert cif:tables/audit from pg

begin;

drop table cif.form_change;

commit;
