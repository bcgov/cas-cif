-- Verify cif:computed_columns/project_revision_anticipated_funding_amount_per_fiscal_year on pg

begin;

select pg_get_functiondef('cif.project_revision_anticipated_funding_amount_per_fiscal_year(cif.project_revision)'::regprocedure);

rollback;
