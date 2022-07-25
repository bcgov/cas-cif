-- Verify cif:computed_columns/project_revision_project_manager_form_changes_by_label on pg

begin;

select pg_get_functiondef('cif.project_revision_project_manager_form_changes_by_label(cif.project_revision)'::regprocedure);

rollback;
