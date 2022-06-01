-- Verify cif:mutations/undo_form_changes on pg

begin;

select pg_get_functiondef('cif.undo_form_changes(integer [])'::regprocedure);

rollback;
