-- Verify cif:trigger_functions/commit_project_revision on pg

begin;

select cif_private.verify_function_not_present('cif_private', 'commit_project_revision', 0);

rollback;
