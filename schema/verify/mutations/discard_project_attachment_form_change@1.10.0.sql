-- Verify cif:mutations/discard_project_attachment_form_change on pg

begin;

select pg_get_functiondef('cif.discard_project_attachment_form_change(int)'::regprocedure);

rollback;
