-- Verify cif:mutations/generate_annual_reports on pg

begin;

select pg_get_functiondef('cif.generate_annual_reports(int, timestamptz, timestamptz)'::regprocedure);

rollback;
