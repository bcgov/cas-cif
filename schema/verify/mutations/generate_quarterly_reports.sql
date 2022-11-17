-- Verify cif:mutations/generate_quarterly_reports on pg

begin;

select pg_get_functiondef('cif.generate_quarterly_reports(int, timestamptz, timestamptz)'::regprocedure);

rollback;
