-- Verify cif:computed_columns/project_revision_anticipated_funding_amount_per_fiscal_year on pg

begin;

select cif_private.verify_function_not_present('cif', 'project_revision_anticipated_funding_amount_per_fiscal_year', 1);

rollback;
