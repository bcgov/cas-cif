-- Verify mocks:schema_mocks on pg

begin;

select pg_catalog.has_schema_privilege('mocks', 'usage');

rollback;
