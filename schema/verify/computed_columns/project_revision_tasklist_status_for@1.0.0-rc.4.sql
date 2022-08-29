-- Verify cif:computed_columns/project_revision_tasklist_status_for on pg

begin;

select pg_get_functiondef('cif.project_revision_tasklist_status_for(cif.project_revision, text, text)'::regprocedure);

rollback;
