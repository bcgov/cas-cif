-- Verify cif:functions/migration_funding_parameter_form_changes_to_single_form_change on pg

begin;

select pg_get_functiondef('cif_private.migration_funding_parameter_form_changes_to_single_form_change()'::regprocedure);

rollback;
