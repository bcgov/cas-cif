-- Revert cif:tables/amendment_status from pg

begin;

drop table cif.amendment_status;

commit;
