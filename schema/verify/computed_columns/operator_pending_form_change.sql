-- Verify cif:computed_columns/operator_pending_form_change on pg

begin;

select pg_get_functiondef('cif.operator_pending_form_change(cif.operator)'::regprocedure);

rollback;
