-- Verify cif:schema/cif_private on pg

begin;

select pg_catalog.has_schema_privilege('cif_private', 'usage');

rollback;
