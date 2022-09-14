-- Verify cif:computed_columns/project_revision_effective_date on pg

begin;

select pg_get_functiondef('cif.project_revision_effective_date(cif.project_revision)'::regprocedure);

rollback;
