-- Revert cif:tables/full_backup_log from pg

begin;

drop table cif_private.full_backup_log;

commit;
