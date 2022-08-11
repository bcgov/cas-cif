-- Revert cif:util_functions/get_fiscal_year_from_timestamp from pg

begin;

drop function cif.get_fiscal_year_from_timestamp;

commit;
