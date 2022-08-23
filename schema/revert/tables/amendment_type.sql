-- Revert cif:tables/amendment_type from pg

begin;

drop table cif.amendment_type;

commit;
