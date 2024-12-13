-- Verify cif:tables/form_002 on pg

begin;

-- Assess that the table exists with the right privileges

select pg_catalog.has_table_privilege('cif.form', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'form', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'form', 'cif_admin');

rollback;
