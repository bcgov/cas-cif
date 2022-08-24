-- Verify cif:mutations/stage_form_change on pg

begin;

select pg_get_functiondef('cif.stage_form_change(int)'::regprocedure);

rollback;
