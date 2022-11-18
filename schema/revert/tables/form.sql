-- Revert cif:tables/form from pg

begin;

drop table cif.form;

commit;
