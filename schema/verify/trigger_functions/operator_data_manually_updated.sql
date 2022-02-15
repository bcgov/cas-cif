-- Verify cif:trigger_functions/operator_data_manually_updated on pg

begin;

select pg_get_functiondef('cif_private.operator_data_manually_updated()'::regprocedure);

rollback;
