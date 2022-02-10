-- Verify cif:trigger_functions/protect_manually_updated_operator_data on pg

begin;

select pg_get_functiondef('cif_private.protect_manually_updated_operator_data()'::regprocedure);

rollback;
