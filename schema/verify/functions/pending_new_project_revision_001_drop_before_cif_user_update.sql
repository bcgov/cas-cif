-- Verify cif:functions/pending_new_project_revision_001_drop_before_cif_user_update on pg

begin;

select cif_private.verify_function_not_present('cif', 'pending_new_project_revision', 0);

rollback;
