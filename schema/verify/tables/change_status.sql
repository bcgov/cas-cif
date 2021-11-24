-- Verify cif:tables/change_status on pg

begin;

select pg_catalog.has_table_privilege('cif.change_status', 'select');

rollback;
