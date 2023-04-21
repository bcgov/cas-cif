-- Verify cif:computed_columns/project_pending_project_revision on pg

begin;

select cif_private.verify_function_not_present('cif', 'project_pending_project_revision', 1);

rollback;
