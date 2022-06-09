-- Verify cif:mutations/stage_dirty_form_changes on pg

begin;

select pg_get_functiondef('cif.stage_dirty_form_changes(integer)'::regprocedure);

rollback;
