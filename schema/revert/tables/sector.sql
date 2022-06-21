-- Revert cif:tables/sector from pg

begin;

drop table cif.sector;

commit;
