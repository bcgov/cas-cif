-- Verify cif:computed_columns/project_next_milestone_due_date on pg

begin;

select pg_get_functiondef('cif.project_next_milestone_due_date(cif.project)'::regprocedure);

rollback;
