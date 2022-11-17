-- Verify cif:tables/revision_status on pg

begin;

select pg_catalog.has_table_privilege('cif.revision_status', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'revision_status', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'revision_status', 'cif_admin');


rollback;
