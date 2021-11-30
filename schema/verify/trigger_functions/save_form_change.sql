-- Verify cif:trigger_functions/commit_form_changes on pg

begin;

select pg_get_functiondef('cif_private.commit_form_change()'::regprocedure);

rollback;
