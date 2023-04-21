-- Verify cif:computed_columns/project_pending_amendment on pg

begin;

select pg_get_functiondef('cif.project_pending_amendment(cif.project)'::regprocedure);

rollback;
