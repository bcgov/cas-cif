-- Verify cif:mutations/generate_reports on pg

begin;

select pg_get_functiondef('cif.generate_reports(int, text, timestamptz, timestamptz)'::regprocedure);

rollback;
