-- Verify cif:tables/sector_001 on pg

begin;

select pg_catalog.has_table_privilege('cif.sector', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'sector', 'cif_internal');
select cif_private.verify_grant('update', 'sector', 'cif_internal');
select cif_private.verify_grant('insert', 'sector', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'sector', 'cif_admin');
select cif_private.verify_grant('insert', 'sector', 'cif_admin');
select cif_private.verify_grant('update', 'sector', 'cif_admin');

rollback;
