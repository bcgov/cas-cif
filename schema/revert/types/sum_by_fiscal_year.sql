-- Revert cif:types/sum_by_fiscal_year from pg

begin;

drop type cif.sum_by_fiscal_year;

commit;
