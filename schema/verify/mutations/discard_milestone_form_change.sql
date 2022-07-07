-- Verify cif:mutations/discard_milestone_form_change on pg

begin;

select pg_get_functiondef('cif.discard_milestone_form_change(int, int)'::regprocedure);

rollback;
