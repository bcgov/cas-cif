-- Deploy cif:types/sum_by_fiscal_year to pg

begin;

create type cif.sum_by_fiscal_year as (
  fiscal_year text,
  anticipated_funding_amount numeric
);

commit;
