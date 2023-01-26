-- Verify cif:util_functions/get_fiscal_year_from_timestamp on pg

begin;

select pg_get_functiondef('cif.get_fiscal_year_from_timestamp(timestamptz)'::regprocedure);

rollback;
