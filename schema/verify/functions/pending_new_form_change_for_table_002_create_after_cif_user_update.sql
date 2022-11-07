-- Verify cif:functions/pending_new_form_change_for_table_002_create_after_cif_user_update on pg

begin;

select pg_get_functiondef('cif.pending_new_form_change_for_table(text)'::regprocedure);

rollback;
