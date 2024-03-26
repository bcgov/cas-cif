-- Verify cif:mutations/commit_form_change on pg

begin;

select pg_get_functiondef('cif_private.commit_form_change_internal(cif.form_change, int)'::regprocedure);

rollback;
