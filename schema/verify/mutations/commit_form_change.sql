-- Verify cif:mutations/commit_form_change on pg

begin;

select pg_get_functiondef('cif.commit_form_change(cif.form_change)'::regprocedure);

rollback;
