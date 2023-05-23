-- Verify cif:computed_columns/project_revision_teimp_payment_percentage on pg

begin;

select pg_get_functiondef('cif.project_revision_teimp_payment_percentage(cif.project_revision)'::regprocedure);

rollback;
