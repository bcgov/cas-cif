-- Revert cif:tables/contact from pg

begin;

drop table cif.contact;

commit;
