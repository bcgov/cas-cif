-- Verify cif:tables/revision_type on pg

begin;

select pg_catalog.has_table_privilege('cif.revision_type', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'revision_type', 'cif_internal');
select cif_private.verify_grant('update', 'revision_type', 'cif_internal');
select cif_private.verify_grant('insert', 'revision_type', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'revision_type', 'cif_admin');
select cif_private.verify_grant('insert', 'revision_type', 'cif_admin');
select cif_private.verify_grant('update', 'revision_type', 'cif_admin');


rollback;
