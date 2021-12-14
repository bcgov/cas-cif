-- Verify cif:tables/operator on pg

begin;

select pg_catalog.has_table_privilege('cif.operator', 'select');

rollback;
