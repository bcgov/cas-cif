-- Verify cif:tables/audit on pg

begin;

select pg_catalog.has_table_privilege('cif.form_change', 'select');

rollback;
