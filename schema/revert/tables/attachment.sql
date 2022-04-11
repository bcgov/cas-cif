-- Revert cif:tables/attachment from pg

begin;

drop table cif.attachment;

commit;
