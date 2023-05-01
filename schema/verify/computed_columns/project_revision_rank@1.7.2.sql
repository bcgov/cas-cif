-- Verify cif:computed_columns/project_revision_rank on pg

begin;

select pg_get_functiondef('cif.project_revision_rank(cif.project_revision)'::regprocedure);

rollback;
