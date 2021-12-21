-- Verify cif:computed_columns/project_revision_project_form_change.sql on pg

begin;

select pg_get_functiondef('cif.project_revision_project_form_change(cif.project_revision)'::regprocedure);

rollback;
