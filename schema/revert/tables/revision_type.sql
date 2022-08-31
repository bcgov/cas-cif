-- Revert cif:tables/revision_type from pg

begin;

drop table cif.revision_type;

commit;
