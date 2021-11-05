-- Verify cif:schema/cif on pg

begin;

select pg_catalog.has_schema_privilege('cif', 'usage');

rollback;
