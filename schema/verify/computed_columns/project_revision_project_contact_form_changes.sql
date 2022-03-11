-- Verify cif:computed_columns/project_revision_project_contact_form_changes on pg

begin;

select pg_get_functiondef('cif.project_revision_project_contact_form_changes(cif.project_revision)'::regprocedure);

rollback;
