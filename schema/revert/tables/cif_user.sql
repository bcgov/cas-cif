-- Revert cif:tables/cif_user on pg

begin;

drop table cif.cif_user;

commit;
