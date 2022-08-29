-- Verify cif:functions/handle_default_form_change_commit on pg

begin;

select pg_get_functiondef('cif_private.handle_default_form_change_commit(cif.form_change)'::regprocedure);

rollback;
