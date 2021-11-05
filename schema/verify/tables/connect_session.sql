-- Verify cif:tables/connect_session on pg

begin;

select pg_catalog.has_table_privilege('cif_private.connect_session', 'select');

rollback;
