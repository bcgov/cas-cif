-- Verify cif:trigger_functions/operator_swrs_organisation_is_immutable on pg

begin;

select pg_get_functiondef('cif_private.operator_swrs_organisation_is_immutable()'::regprocedure);

rollback;
