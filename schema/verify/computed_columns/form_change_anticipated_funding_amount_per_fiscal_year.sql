-- Verify cif:computed_columns/form_change_anticipated_funding_amount_per_fiscal_year on pg

begin;

select pg_get_functiondef('cif.form_change_anticipated_funding_amount_per_fiscal_year(cif.form_change)'::regprocedure);

rollback;
