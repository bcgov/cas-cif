-- Verify cif:tables/form on pg

begin;

select pg_catalog.has_table_privilege('cif.form', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'form', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'form', 'cif_admin');

rollback;
