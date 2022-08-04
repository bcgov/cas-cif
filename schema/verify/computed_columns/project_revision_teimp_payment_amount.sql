-- Verify cif:computed_columns/project_revision_teimp_payment_amount on pg

begin;

select pg_get_functiondef('cif.project_revision_teimp_payment_amount(cif.project_revision)'::regprocedure);

rollback;
