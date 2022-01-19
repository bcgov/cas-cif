-- Verify cif:tables/contact on pg

begin;

select pg_catalog.has_table_privilege('cif.operator', 'select');

rollback;
