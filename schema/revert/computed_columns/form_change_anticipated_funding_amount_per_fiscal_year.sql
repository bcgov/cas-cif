-- Revert cif:computed_columns/form_change_anticipated_funding_amount_per_fiscal_year from pg

begin;

drop function cif.form_change_anticipated_funding_amount_per_fiscal_year;

commit;
