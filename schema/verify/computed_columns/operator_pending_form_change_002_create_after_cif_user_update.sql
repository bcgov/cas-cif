-- Verify cif:computed_columns/operator_pending_form_change_002_create_after_cif_user_update on pg

begin;

select pg_get_functiondef('cif.operator_pending_form_change(cif.operator)'::regprocedure);

rollback;
