-- Verify cif:functions/session_003_reorder_setting_selection on pg

begin;

select pg_get_functiondef('cif.session()'::regprocedure);

rollback;
