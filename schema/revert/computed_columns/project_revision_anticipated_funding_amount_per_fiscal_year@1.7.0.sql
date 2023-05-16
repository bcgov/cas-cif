-- Revert cif:computed_columns/project_revision_anticipated_funding_amount_per_fiscal_year from pg

begin;

drop function cif.project_revision_anticipated_funding_amount_per_fiscal_year;

commit;
