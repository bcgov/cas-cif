-- Verify cif:tables/full_backup_log on pg

begin;

select pg_catalog.has_table_privilege('cif_private.full_backup_log', 'select');

rollback;
