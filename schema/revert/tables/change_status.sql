-- Revert cif:tables/change_status from pg

begin;

drop table cif.change_status;

commit;
