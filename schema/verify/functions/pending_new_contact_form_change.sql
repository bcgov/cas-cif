-- Verify cif:functions/pending_new_contact_form_change on pg

begin;

select pg_get_functiondef('cif.pending_new_contact_form_change()'::regprocedure);

rollback;
