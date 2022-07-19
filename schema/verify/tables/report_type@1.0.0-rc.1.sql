-- Verify cif:tables/report_type on pg

begin;

select pg_catalog.has_table_privilege('cif.report_type', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'report_type', 'cif_internal');
select cif_private.verify_grant('update', 'report_type', 'cif_internal');
select cif_private.verify_grant('insert', 'report_type', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'report_type', 'cif_admin');
select cif_private.verify_grant('insert', 'report_type', 'cif_admin');
select cif_private.verify_grant('update', 'report_type', 'cif_admin');


rollback;
