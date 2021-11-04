-- Verify cif:tables/project on pg

begin;

select pg_catalog.has_table_privilege('cif.project', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'project', 'cif_internal');
select cif_private.verify_grant('insert', 'project', 'cif_internal');
select cif_private.verify_grant('update', 'project', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'project', 'cif_admin');
select cif_private.verify_grant('insert', 'project', 'cif_admin');
select cif_private.verify_grant('update', 'project', 'cif_admin');


rollback;
