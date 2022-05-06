-- Verify cif:computed_columns/project_revision_project_contacts_status on pg

begin;

select pg_get_functiondef('cif.project_revision_project_contacts_status(cif.project_revision)'::regprocedure);

rollback;
