-- Verify cif:tables/milestone_report on pg

begin;

select pg_catalog.has_table_privilege('cif.milestone_report', 'select');

-- cif_internal Grants
select cif_private.verify_grant('select', 'milestone_report', 'cif_internal');
select cif_private.verify_grant('insert', 'milestone_report', 'cif_internal');
select cif_private.verify_grant('update', 'milestone_report', 'cif_internal');

-- cif_admin Grants
select cif_private.verify_grant('select', 'milestone_report', 'cif_admin');
select cif_private.verify_grant('insert', 'milestone_report', 'cif_admin');
select cif_private.verify_grant('update', 'milestone_report', 'cif_admin');

rollback;
